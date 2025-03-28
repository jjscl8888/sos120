package com.sos.controller;

import com.sos.entity.CategoryDocument;
import com.sos.entity.ContentDocument;
import com.sos.repository.CategoryRepository;
import com.sos.repository.ContentRepository;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final CategoryRepository categoryRepository;
    private final ContentRepository contentRepository;

    public AdminController(CategoryRepository categoryRepository, ContentRepository contentRepository) {
        this.categoryRepository = categoryRepository;
        this.contentRepository = contentRepository;
    }
    @GetMapping("/getCategories")
    public List<CategoryDocument> getCategories() {
        return categoryRepository.findAll();
    }

    @PostMapping("/create")
    public CategoryDocument createCategory(
    
        @RequestParam(required = false) String parentCategory,
        @RequestParam String subcategory) {
        
        if (parentCategory != null) {
            // 处理二级分类
            CategoryDocument parent = categoryRepository.findById(parentCategory)
                .orElseThrow(() -> new RuntimeException("父分类不存在"));
            if (parent.getSubcategories() == null) {
                parent.setSubcategories(new ArrayList<>());
            }
            if (!parent.getSubcategories().contains(subcategory)) {
                parent.getSubcategories().add(subcategory);
            }
            return categoryRepository.save(parent);
        } else {
            // 处理一级分类
            CategoryDocument existingCategory = categoryRepository.findByCategoryKey(subcategory);
            if (existingCategory != null) {
                return existingCategory;
            }
            CategoryDocument category = new CategoryDocument();
            category.setCategoryKey(subcategory);
            category.setSubcategories(new ArrayList<>());
            return categoryRepository.save(category);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteCategory(
        @RequestParam(required = false) String parentCategory,
        @RequestParam(required = false) String categoryId, // 一级分类主键 ID
        @RequestParam(required = false) String subcategoryName) { // 二级分类名称
        
        try {
            if (parentCategory != null) {
                // 删除二级分类
                CategoryDocument parent = categoryRepository.findById(parentCategory)
                    .orElseThrow(() -> new RuntimeException("父分类不存在"));
                if (parent.getSubcategories() != null) {
                    parent.getSubcategories().remove(subcategoryName);
                    categoryRepository.save(parent);
                }
            } else {
                // 删除一级分类
                if (categoryId == null) {
                    return ResponseEntity.badRequest().body("缺少主键 ID");
                }
                categoryRepository.deleteById(categoryId);
            }
            return ResponseEntity.ok().build(); // 返回 200 OK 状态码
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("删除失败：" + e.getMessage()); // 返回 500 状态码和错误信息
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateCategory(
        @RequestParam(required = false) String parentCategory,
        @RequestParam(required = false) String categoryId,
        @RequestParam(required = false) String subcategoryName,
        @RequestParam String newName) {
        
        try {
            if (parentCategory != null) {
                // 修改二级分类
                CategoryDocument parent = categoryRepository.findById(parentCategory)
                    .orElseThrow(() -> new RuntimeException("父分类不存在"));
                if (parent.getSubcategories() != null) {
                    int index = parent.getSubcategories().indexOf(subcategoryName);
                    if (index != -1) {
                        parent.getSubcategories().set(index, newName);
                    }
                    categoryRepository.save(parent);
                    // 根据一级分类和二级分类查ategoryKey，更新对应的ContentDocument的categoryKey和subcategoryKey
                    ContentDocument contentDocument = contentRepository.findByCategoryKeyAndSubcategoryKey(parent.getCategoryKey(), subcategoryName);
                    if (contentDocument!= null) {
                        contentDocument.setSubcategoryKey(newName);
                        contentRepository.save(contentDocument);
                    } else {
                        contentDocument = new ContentDocument();
                        contentDocument.setCategoryKey(parent.getCategoryKey());
                        contentDocument.setSubcategoryKey(newName);
                        contentRepository.save(contentDocument);
                    }
                }
            } else {
                // 修改一级分类
                CategoryDocument category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
                String oldKey = category.getCategoryKey();
                category.setCategoryKey(newName);
                categoryRepository.save(category);
                // 根据一级分类查categoryKey，更新对应的ContentDocument的categoryKey
                List<ContentDocument> contentDocumentList = contentRepository.findByCategoryKey(oldKey);
                for (ContentDocument contentDocument : contentDocumentList) {
                    contentDocument.setCategoryKey(newName);
                    contentRepository.save(contentDocument);
                }
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("修改失败：" + e.getMessage());
        }
    }

    @PostMapping("/createContent")
    public ResponseEntity<ContentDocument> createContent(
        @RequestParam String categoryKey,
        @RequestParam String subcategoryKey,
        @RequestParam String title,
        @RequestParam List<String> steps,
        @RequestParam List<String> precautions,
        @RequestParam(required = false) List<String> videoURLs) {
        
        // 使用 orElseThrow 方法从 Optional 中获取 ContentDocument 对象，如果不存在则抛出异常
        ContentDocument content = contentRepository.findByCategoryKeyAndSubcategoryKey(categoryKey, subcategoryKey);
        if (content == null) {
            // 如果不存在，创建一个新的 ContentDocument 对象
            content = new ContentDocument();
            content.setCategoryKey(categoryKey);
            content.setSubcategoryKey(subcategoryKey);
        }
        content.setTitle(title);
        content.setSteps(steps);
        content.setPrecautions(precautions);
        content.setVideoURL(videoURLs != null ? videoURLs : new ArrayList<>());
        
        return ResponseEntity.ok(contentRepository.save(content));
    }
}