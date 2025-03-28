package com.sos.entity;

import lombok.Data;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "categories")
@Data
public class CategoryDocument {
    @Id
    private String id;
    private String categoryKey;
    private List<String> subcategories;
}
