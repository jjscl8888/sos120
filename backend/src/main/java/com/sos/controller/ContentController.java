package com.sos.controller;

// 这些错误通常是由于Java运行环境或类路径配置问题导致的。
// 要解决这些问题，你可以尝试以下步骤：
// 1. 确保你的IDE（如Trae）正确配置了Java SDK。
// 2. 检查项目的构建路径，确保所有必要的库都已正确添加。
// 3. 尝试重新导入项目或重新构建项目。

import com.sos.entity.CategoryDocument;
import com.sos.entity.ContentDocument;
import com.sos.repository.CategoryRepository;
import com.sos.repository.ContentRepository;

import java.util.List;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/content")
public class ContentController {
    @Autowired
    private CategoryRepository categoryRepository;
    @Autowired
    private ContentRepository contentRepository;

    @GetMapping("/categories")
    public List<CategoryDocument> getAllCategories() {
        return categoryRepository.findAll();
    }

    @GetMapping("/{categoryKey}")
    public List<ContentDocument> getByCategory(@PathVariable String categoryKey) {
        String decodedCategoryKey = URLDecoder.decode(categoryKey, StandardCharsets.UTF_8);
        return contentRepository.findByCategoryKey(decodedCategoryKey);
    }

    @GetMapping("/{categoryKey}/{subcategoryKey}")
    public ContentDocument getContentDetail(@PathVariable String categoryKey, @PathVariable String subcategoryKey) {
        String decodedCategoryKey = URLDecoder.decode(categoryKey, StandardCharsets.UTF_8);
        String decodedSubcategoryKey = URLDecoder.decode(subcategoryKey, StandardCharsets.UTF_8);
        
        // 调试信息
        System.out.println("Decoded categoryKey: " + decodedCategoryKey);
        System.out.println("Decoded subcategoryKey: " + decodedSubcategoryKey);
        
        ContentDocument content = contentRepository.findByCategoryKeyAndSubcategoryKey(decodedCategoryKey, decodedSubcategoryKey);
        
        // 调试信息
        System.out.println("Query result: " + content);
        
        return content;
    }
}