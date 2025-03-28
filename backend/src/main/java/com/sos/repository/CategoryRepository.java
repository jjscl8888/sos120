package com.sos.repository;

import com.sos.entity.CategoryDocument;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository extends MongoRepository<CategoryDocument, String> {

    CategoryDocument findByCategoryKey(String name);

    void deleteByCategoryKey(String categoryName);
}