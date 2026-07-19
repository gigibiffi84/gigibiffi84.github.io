---
title: "Cookie Disclaimer with CookieCuttr"
description: "A simple way to conform your site to the EU Cookie Law"
date: 2015-06-12
tags: ["cookie eu law", "cookie", "jquery", "cookiecuttr"]
lang: en
translationKey: "cookie-disclaimer"
---

If you are trying to get a simple way to be conformed to the EU Cookie Law i suggest [this](https://github.com/weare2ndfloor/cookieCuttr) library. _CookieCuttr_ enables you to implement opt-in and opt-out policy mechanisms using jQuery. 
Calling this function:
```
$.cookieCuttr();
```
simply shows an elegant header bar with a small notice and two buttons to accept or decline analytics cookies.

Furthermore _CookieCuttr_ enables you to check if the user accepted or declined the cookies and implement your conditional logic as well. For example in my site i add this piece of code on tracking logic, for demo purpose i wrote a simple console.log in the accept and decline cases:
```
if (jQuery.cookie('cc_cookie_accept') == "cc_cookie_accept") {
   console.log('analitycs cookie accepted');
}
else{
  console.log('analitycs cookie declined');
}
```

A disclaimer notice implemented in this way is full compliant with the EU Cookie Law.... ffiiiuu  no violation for me at least. Bye.

Luigi Bifulco
