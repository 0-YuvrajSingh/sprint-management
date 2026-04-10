# AgileTrack Unified Orchestration Script
# Purpose: Start all microservices and frontend with reliability and health-check gating.

$ErrorActionPreference = "Stop"

# Configuration
$SERVICES = @(
    @{ Name = "eureka-server"; Dir = "backend/eureka-server"; Port = 8761; Type = "Maven"; DependOn = $null },
    @{ Name = "auth-service"; Dir = "backend/auth-service"; Port = 8081; Type = "Maven"; DependOn = "eureka-server" },
    @{ Name = "user-service"; Dir = "backend/user-service"; Port = 8083; Type = "Maven"; DependOn = "eureka-server" },
    @{ Name = "project-service"; Dir = "backend/project-service"; Port = 8082; Type = "Maven"; DependOn = "eureka-server" },
    @{ Name = "sprint-service"; Dir = "backend/sprint-service"; Port = 8084; Type = "Maven"; DependOn = "eureka-server" },
    @{ Name = "activity-service"; Dir = "backend/activity-service"; Port = 8085; Type = "Maven"; DependOn = "eureka-server" },
    @{ Name = "stories-service"; Dir = "backend/stories-service"; Port = 8086; Type = "Maven"; DependOn = "eureka-server" },
    @{ Name = "api-gateway"; Dir = "backend/api-gateway"; Port = 8080; Type = "Maven"; DependOn = "eureka-server" }
)

$FRONTEND = @{ Name = "frontend"; Dir = "frontend"; Port = 5173; Type = "Npm" }

$LOG_DIR = Join-Path $PSScriptRoot "..\logs"
$ARCHIVE_DIR = Join-Path $LOG_DIR "archive"
$STATE_FILE = Join-Path $PSScriptRoot "..\.service_state.json"
$GLOBAL_TIMEOUT_SEC = 600 # 10 minutes total system readiness

# 1. Initialization
Write-Host "`n[1/6] Initializing Orchestration..." -ForegroundColor Cyan
if (-not (Test-Path $LOG_DIR)) { New-Item -ItemType Directory -Path $LOG_DIR | Out-Null }
if (-not (Test-Path $ARCHIVE_DIR)) { New-Item -ItemType Directory -Path $ARCHIVE_DIR | Out-Null }

# Archive old logs
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$current_archive = Join-Path $ARCHIVE_DIR $timestamp
New-Item -ItemType Directory -Path $current_archive | Out-Null
Get-ChildItem $LOG_DIR -Filter "*.log" | Move-Item -Destination $current_archive -ErrorAction SilentlyContinue

# 2. Dependency Validation
Write-Host "[2/6] Validating Environment Dependencies..." -ForegroundColor Cyan
function Test-Port($port, $name) {
    try {
        $connection = New-Object System.Net.Sockets.TcpClient("localhost", $port)
        if ($connection) {
            $connection.Close()
            return $true
        }
    } catch {
        return $false
    }
}

if (-not (Test-Port 5432 "PostgreSQL")) {
    Write-Error "PostgreSQL (5432) is not reachable. Please start it before running."
}
if (-not (Test-Port 6379 "Redis")) {
    Write-Warning "Redis (6379) is not reachable. Some services may experience issues."
}

# 3. Build Libraries
Write-Host "[3/6] Building Shared Libraries..." -ForegroundColor Cyan
function Build-Library($dir) {
    Write-Host "  Building $dir..." -NoNewline
    $fullDir = Join-Path $PSScriptRoot "..\$dir"
    Push-Location $fullDir
    
    $mvnCmd = if (Test-Path ".\mvnw.cmd") { ".\mvnw.cmd" } else { "mvn" }
    
    $output = cmd /c "$mvnCmd clean install -DskipTests" 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " FAILED" -ForegroundColor Red
        Write-Error "Failed to build $dir. Check logs for details. Output: $output"
    }
    Pop-Location
    Write-Host " DONE" -ForegroundColor Green
}

Build-Library "backend/common-error"
Build-Library "backend/common-security"

# 4. Service Startup Helper
$ServicePids = @{}

function Start-Service($service) {
    $name = $service.Name
    $dir = $service.Dir
    $port = $service.Port
    $logFile = Join-Path $LOG_DIR "$name.log"

    Write-Host "  Starting $name on port $port..." -ForegroundColor Yellow
    $fullDir = Join-Path $PSScriptRoot "..\$dir"
    Push-Location $fullDir
    
    $mvnCmd = if (Test-Path ".\mvnw.cmd") { ".\mvnw.cmd" } else { "mvn" }
    
    # Use shell-level redirection (>) instead of Start-Process redirection parameters for better compatibility
    $process = Start-Process -FilePath "cmd.exe" -ArgumentList "/c $mvnCmd spring-boot:run > `"$logFile`" 2>&1" -WindowStyle Hidden -PassThru
    $ServicePids[$name] = $process.Id
    
    Pop-Location
}

function Wait-ForService($service, $timeout = 180) {
    $name = $service.Name
    $port = $service.Port
    $url = "http://localhost:$port/actuator/health"
    $start = Get-Date
    
    Write-Host "  Waiting for $name health..." -NoNewline
    while (((Get-Date) - $start).TotalSeconds -lt $timeout) {
        try {
            # Use Invoke-RestMethod for automatic JSON parsing, catch 503s to parse body manually
            $health = Invoke-RestMethod -Uri $url -ErrorAction Stop
        } catch [System.Net.WebException] {
            if ($_.Exception.Response) {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $responseBody = $reader.ReadToEnd()
                try {
                    $health = $responseBody | ConvertFrom-Json
                } catch {
                    $health = $null
                }
            }
        } catch {
            $health = $null
        }

        if ($null -ne $health) {
            # Additional granular check for DB/Redis components
            $components = $health.components
            $downstreamFail = $false
            
            if ($null -ne $components) {
                foreach ($c in $components.PSObject.Properties) {
                    # Ignore redis if it's down because it's optional
                    if ($c.Name -eq "redis") { continue }
                    
                    if ($c.Value.status -ne "UP" -and $c.Value.status -ne $null) {
                        $downstreamFail = $true
                        break
                    }
                }
            } else {
                # If no components block exposed, just rely on top-level status
                if ($health.status -ne "UP") { $downstreamFail = $true }
            }

            if (-not $downstreamFail) {
                Write-Host " READY" -ForegroundColor Green
                return $true
            }
        }
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 3
    }
    Write-Host " TIMEOUT (Last Status: $($health.status))" -ForegroundColor Red
    return $false
}

# 5. Execution Phase
Write-Host "[4/6] Launching Microservices Ecosystem..." -ForegroundColor Cyan

# Start Eureka First
Start-Service $SERVICES[0]
if (-not (Wait-ForService $SERVICES[0] 120)) {
    Write-Error "Eureka Server failed to start. Aborting."
}

# Start all other services in parallel
$otherServices = $SERVICES[1..($SERVICES.Count-1)]
foreach ($s in $otherServices) {
    Start-Service $s
}

# Wait for all other services
$allReady = $true
foreach ($s in $otherServices) {
    if (-not (Wait-ForService $s 180)) {
        $allReady = $false
    }
}

if (-not $allReady) {
    Write-Warning "One or more core services failed to reach READY state. System may be unstable."
}

# Save state
$ServicePids | ConvertTo-Json | Out-File $STATE_FILE

# 6. Frontend Initialization
Write-Host "[5/6] Starting Frontend..." -ForegroundColor Cyan
Push-Location (Join-Path $PSScriptRoot "..\frontend")
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $LOG_DIR "frontend.log") -RedirectStandardError (Join-Path $LOG_DIR "frontend.log")
$ServicePids["frontend"] = $frontendProcess.Id
$ServicePids | ConvertTo-Json | Out-File $STATE_FILE
Pop-Location

# Verify Frontend Health
$feStart = Get-Date
$feReady = $false
Write-Host "  Waiting for Frontend (Vite)..." -NoNewline
while (((Get-Date) - $feStart).TotalSeconds -lt 60) {
    try {
        $feResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method HEAD -ErrorAction Ignore
        if ($feResponse.StatusCode -eq 200) {
            $feReady = $true
            Write-Host " READY" -ForegroundColor Green
            break
        }
    } catch {}
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
}

if ($feReady) {
    Write-Host "`n[6/6] AgileTrack is now UP and RUNNING!" -ForegroundColor Green
    Write-Host "Registry:  http://localhost:8761"
    Write-Host "Gateway:   http://localhost:8080"
    Write-Host "Frontend:  http://localhost:5173"
    Write-Host "`nLogs are available in: $LOG_DIR"
    Write-Host "To stop all services, run: scripts/stop-all.ps1" -ForegroundColor Cyan
} else {
    Write-Warning "`nFrontend did not respond within 60s. Check logs/frontend.log"
}
