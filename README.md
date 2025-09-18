# 🧱 Lego-DealEvaluator

Welcome to **Lego-DealEvaluator**!  
This repository contains a web application designed to analyze LEGO set deals and determine whether a given offer is really profitable.  
The project was carried out as part of my coursework, and combines **front-end design, web scraping, API consumption, and deployment**.

---

## 📋 Project Overview
The main goal of this project is to build an **end-to-end application** that helps users evaluate LEGO deals in real time.  
It integrates several components:

- 🧱 **Manipulate LEGO deals** directly in the browser  
- 🧹 **Scrape online sales** (from Vinted) and fetch deals through APIs  
- 📱 **Render results** interactively in the browser  
- 💽 **Save data in a database** to avoid redundant scraping  
- ⤵️ **Provide access via an API** for querying deals and sales  
- 🚀 **Deploy online with Vercel** to make the app accessible to anyone  

---

## 🌟 Key Features
- Interactive filters (by discount, comments, hot deals, favorites, etc.)  
- Deal visualization with prices, discounts, publication dates, and comments  
- Integration of Vinted sales data for real-world LEGO set offers  
- Dynamic indicators (number of deals, sales, average price, percentiles, lifetime value)  
- Ability to favorite deals and sort by different criteria  
- Design with HTML/CSS/JS  

---

## 📸 Screenshots  

 **Main interface – LEGO deals and indicators**  
![Lego Deals](images/ImageWebApplicationLego.png)  

**Example of fetched Vinted sales**  
![Vinted Sales](images/Image2WebApplicationLego.png) 

---

## 🛠️ Technologies & Libraries
- **Front-end**: HTML, CSS, JavaScript  
- **Back-end / API**: Node.js, Express  
- **Database**: MongoDB  
- **Scraping**: Fetch / API integration  
- **Deployment**: Vercel  

---

## 📁 Project Structure
- `/client` → Front-end (HTML, CSS, JS)  
- `/server` → API and data management  
- `/workshops` → Step-by-step workshops from the course  
- `/design` → UI and design elements  
- `/slides` → Project explanations and course material  

---

## 📝 Licence
This project was initially forked from my professor’s repository, and extended with my own work.

---

# 🧱 Lego

> First bricks for profitability

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [📱 Context](#-context)
- [🤔 The bullet-list Problems](#-the-bullet-list-problems)
- [🎯 Objective](#-objective)
- [🛣 How to solve it?](#%F0%9F%9B%A3-how-to-solve-it)
- [👩🏽‍💻 Step by step with Workshops](#%E2%80%8D-step-by-step-with-workshops)
- [📝 Licence](#-licence)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 📱 Context

LEGO investments is a good source of profit. 

## 🤔 The bullet-list Problems

Collecting profit on your LEGO investments isn’t as easy as it sounds.

* How to identify profitable lego sets?
* How to buy lego sets under the retail price to maximise the profit?
* How to sell profitable lego sets above the retail price?

## 🎯 Objective

**Build an end-to-end web application to determine if a lego set deal is really a good deal.**

## 🛣 How to solve it?

1. 🧱 **Manipulate deals and sold items**: How to [manipulate](https://github.com/92bondstreet/inception/blob/master/themes/1.md#about-javascript) the products in the [browser](https://github.com/92bondstreet/inception/blob/master/themes/1.md#about-htmlcss)
2. 🧹 **Scrape deals and sales**: How to [fetch](https://github.com/92bondstreet/inception/blob/master/themes/2.md#about-nodejs) Products from different website sources
3. 📱 **Render deals and sales in the browser**: How to [interact](https://github.com/92bondstreet/inception/blob/master/themes/3.md#about-prototyping) with the Products in the browser
4. 💽 **Save deals and sales in database**: How to avoid to scrape again and again the same data
5. ⤵️ **Request deals and sales with an api**: How to [give access](https://github.com/92bondstreet/inception/blob/master/themes/2.md#about-restful-api) to your data
6. 🐛 **Test your code**: How to [ensure quality](https://github.com/92bondstreet/inception/blob/master/themes/2.md#about-readme-driven-comment-driven-and-test-driven-development) and confidence
7. 🚀 **Deploy in production**: How to [give access](https://github.com/92bondstreet/inception/blob/master/themes/2.md#about-serverless) to anyone
8. 🎨 **Make a frictionless experience**: How to easily identify profitable deals in [very flew clicks](https://github.com/92bondstreet/inception/blob/master/themes/3.md#about-ux-best-practices)
9. ...

## 👩🏽‍💻 Step by step with Workshops

With [inception](https://github.com/92bondstreet/inception?tab=readme-ov-file#%EF%B8%8F-the-3-themes) themes, we'll follow next workshops to solve our problem:

| Step | Workshops | Planned Date
| --- | --- | ---
| 1 | [Manipulate data with JavaScript in the browser](./workshops/1-manipulate-javascript.md) | Jan 2025
| 2 | [Interact data with JavaScript, HTML and CSS in the browser again](./workshops/2-interact-js-css.md) | Jan 2025
| 3 | [Be an advocate for your design](./workshops/3-advocate-your-design.md) | Jan 2025
| 4 | [Scrape data with Node.js](./workshops/4-scrape-node.md) | Feb 2025
| 5 | [Save data in a Database with MongoDB](./workshops/5-store-mongodb.md) | Mar 2024
| 6 | [Build an api with Express to request data](./workshops/6-api-express.md) | Mar 2025
| 7 | [Deploy in production with Vercel](./workshops/7-deploy.md) | Mar 2025
| n | Design an effective experience | Mar 2025

## 📝 Licence

[Uncopyrighted](http://zenhabits.net/uncopyright/)
