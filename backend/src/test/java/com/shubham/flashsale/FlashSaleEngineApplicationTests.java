package com.shubham.flashsale;

import com.shubham.flashsale.product.entity.Product;
import com.shubham.flashsale.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FlashSaleEngineApplicationTests {

	@Autowired
	private ProductRepository productRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void shouldSaveAndRetrieveProductWithJsonMetadata() {
		// Clean up existing products with same name if any
		productRepository.findAll().stream()
				.filter(p -> "Test Gaming Mouse".equals(p.getName()))
				.forEach(p -> productRepository.delete(p));

		Product product = Product.builder()
				.name("Test Gaming Mouse")
				.description("RGB Wireless Gaming Mouse")
				.basePrice(BigDecimal.valueOf(1999.00))
				.metadata(java.util.Map.of("brand", "Logitech", "color", "Black"))
				.isActive(true)
				.build();

		Product saved = productRepository.save(product);
		assertNotNull(saved.getId());
		assertNotNull(saved.getUuid());

		Optional<Product> retrievedOpt = productRepository.findById(saved.getId());
		assertTrue(retrievedOpt.isPresent());
		Product retrieved = retrievedOpt.get();

		assertEquals("Test Gaming Mouse", retrieved.getName());
		assertEquals(product.getMetadata(), retrieved.getMetadata());

		// Clean up
		productRepository.delete(retrieved);
	}

}
