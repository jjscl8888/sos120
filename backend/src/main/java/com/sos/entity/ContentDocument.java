package com.sos.entity;

import lombok.Data;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "contents")
@Data
public class ContentDocument {
    @Id
    private String id;
    private String categoryKey;
    private String subcategoryKey;
    private String title;
    private List<String> steps;
    private List<String> precautions;
    private List<String> videoURL;
}