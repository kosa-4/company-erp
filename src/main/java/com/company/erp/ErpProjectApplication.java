package com.company.erp;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.company.erp")
@SpringBootApplication
public class ErpProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(ErpProjectApplication.class, args);
		System.out.println("Server started successfully");
	}

}
