package com.ecobazaarx.config;

import com.ecobazaarx.entity.Brand;
import com.ecobazaarx.entity.Category;
import com.ecobazaarx.entity.User;
import com.ecobazaarx.repository.BrandRepository;
import com.ecobazaarx.repository.CategoryRepository;
import com.ecobazaarx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;
        private final BrandRepository brandRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) throws Exception {
                if (userRepository.count() == 0) {
                        User admin = User.builder()
                                        .name("Admin User")
                                        .email("admin@eco.com")
                                        .password(passwordEncoder.encode("password"))
                                        .role("ADMIN")
                                        .phone("1234567890")
                                        .build();
                        userRepository.save(admin);
                        System.out.println("Admin user created: admin@eco.com / password");

                        User seller = User.builder()
                                        .name("Seller User")
                                        .email("seller@eco.com")
                                        .password(passwordEncoder.encode("password"))
                                        .role("SELLER")
                                        .phone("0987654321")
                                        .build();
                        userRepository.save(seller);
                        System.out.println("Seller user created: seller@eco.com / password");
                }

                if (categoryRepository.count() == 0) {
                        categoryRepository.save(Category.builder().name("Electronics").slug("electronics")
                                        .description("Gadgets and devices").imageUrl("https://placehold.co/100")
                                        .build());
                        categoryRepository.save(Category.builder().name("Fashion").slug("fashion")
                                        .description("Clothing and accessories").imageUrl("https://placehold.co/100")
                                        .build());
                        categoryRepository.save(Category.builder().name("Home & Living").slug("home-living")
                                        .description("Furniture and decor").imageUrl("https://placehold.co/100")
                                        .build());
                        System.out.println("Default categories seeded.");
                }

                if (brandRepository.count() == 0) {
                        brandRepository.save(Brand.builder().name("EcoBrand").slug("ecobrand")
                                        .imageUrl("https://placehold.co/100").build());
                        brandRepository.save(Brand.builder().name("GreenTech").slug("greentech")
                                        .imageUrl("https://placehold.co/100").build());
                        brandRepository.save(Brand.builder().name("SustainableLife").slug("sustainable-life")
                                        .imageUrl("https://placehold.co/100").build());
                        System.out.println("Default brands seeded.");
                }
        }
}
