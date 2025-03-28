package com.sos.repository;

import com.sos.entity.ContentDocument;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ContentRepository extends MongoRepository<ContentDocument, String> {
    List<ContentDocument> findByCategoryKey(String categoryKey);
    ContentDocument findByCategoryKeyAndSubcategoryKey(String categoryKey, String subcategoryKey);
}