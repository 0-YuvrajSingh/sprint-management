# AgileTrack Graceful Shutdown Script

$ErrorActionPreference = "SilentlyContinue"
$STATE_FILE = Join-Path $PSScriptRoot "..\.service_state.json"
$PORTS = @(8080, 8081, 8082, 8083, 8084, 8085, 8086, 8761, 5173)

Write-Host "`n[1/3] Terminating Services..." -ForegroundColor Cyan

if (Test-Path $STATE_FILE) {
    $state = Get-Content $STATE_FILE | ConvertFrom-Json
    foreach ($name in $state.PSObject.Properties.Name) {
        $pid = $state.$name
        Write-Host "  Stopping $name (PID: $pid)..." -NoNewline
        try {
            $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($proc) {
                # Try to stop nicely
                Stop-Process -Id $pid -Confirm:$false
                Start-Sleep -Seconds 1
                if (-not (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
                    Write-Host " DONE" -ForegroundColor Green
                } else {
                    Write-Host " FORCE-KILLING" -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -Confirm:$false
                }
            } else {
                Write-Host " ALREADY STOPPED" -ForegroundColor Gray
            }
        } catch {
            Write-Host " FAILED" -ForegroundColor Red
        }
    }
    Remove-Item $STATE_FILE
} else {
    Write-Host "  No active .service_state.json found. Attempting port-based cleanup..." -ForegroundColor Yellow
}

Write-Host "[2/3] Validating Port Release..." -ForegroundColor Cyan
foreach ($port in $PORTS) {
    Write-Host "  Checking Port $port..." -NoNewline
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        Write-Host " STILL OCCUPIED (PID: $($conn.OwningProcess))" -ForegroundColor Red
        # Kill whatever is on this port if it's the owner
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    } else {
        Write-Host " FREE" -ForegroundColor Green
    }
}

Write-Host "[3/3] Cleanup Complete." -ForegroundColor Cyan
Write-Host "AgileTrack services have been stopped." -ForegroundColor Green
