
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RestTemplate restTemplate;

    @Value("${gateway.secret}")
    private String gatewaySecret;

    @Transactional
    public void registerUser(RegisterRequest registerRequest) {

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException(registerRequest.getEmail());
        }

        Role role = getDefaultRole();

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        syncUserProfile(registerRequest);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest loginRequest) {

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            throw new InvalidCredentialsException();
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private Role getDefaultRole() {
        return Role.VIEWER;
    }
    
    /*
     * Internal service-to-service call.
     * Authenticated using gateway secret.
     * ADMIN role is used only for trusted internal communication.
     * Client cannot trigger this directly.
     */
    private void syncUserProfile(RegisterRequest req) {

        try {

            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Gateway-Secret", gatewaySecret);
            headers.set("X-User-Email", "system@auth-service");
            headers.set("X-User-Role", Role.ADMIN.name());
            headers.set("Content-Type", "application/json");

            UserProfileRequest body = new UserProfileRequest(
                    req.getName(),
                    req.getEmail(),
                    getDefaultRole()
            );

            restTemplate.exchange(
                    "http://user-service/api/users/register",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Void.class
            );

        } catch (RestClientException ex) {

            log.warn(
                    "Failed to sync user profile for email={}",
                    req.getEmail()
            );
        }
    }
}
