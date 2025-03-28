package com.sos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AdminControllerPage {
    @GetMapping("/admin")
    public String admin() {
        return "forward:/index.html"; // 返回前端应用的入口文件
    }
}
