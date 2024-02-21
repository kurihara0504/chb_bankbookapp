package com.moneyforward;

import com.moneyforward.bankbookbase.base.session.BaseNotNeedSessionCheck;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/")
public class IndexController {

    @GetMapping
    @BaseNotNeedSessionCheck
    public String index() {
        return "index.html";
    }
}
