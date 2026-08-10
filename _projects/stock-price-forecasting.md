---
title: "Stock Volume Forecasting Model"
summary: "We are using time-series forecasting techniques here on a dataset of APPLE's stock-market data. The data is passed through cleaning and Exploratory analysis steps, followed by seasonality check and finally selecting the best fit model"
category: "Case Study"
tags: [Python, Time-Series, Stock Market]
spark_color: "#F2B84B"
sparkline: "M0,35 C30,30 40,10 70,15 C100,20 110,5 140,8 C160,10 180,3 200,5"
repo_url: "https://github.com/Amitav507/Stock_prediction"
order: 2
image: "/assets/images/projects/stock_volume.png"
# image_alt: "Dispatch strategy comparison chart"

---

## The problem

Taking a raw dataset of stock volumes traded daily and building an end-to-end pipeline for data loading, cleaning and making it suitable for forecasting model frameworks.

## Approach

-As part of EDA we make sure that all target variable data is numerical, time-series formatting is proper, there is no missing data, time stamps are continuous and in ascending order and overall time-series is stationery.

-While cleaning and sorting the data, it's important to make sure all Business holidays are taken care of.

-Since there is seasonality in the data, we decompose and find the frequency.

-Determine the series is stationery using Augmented Dickey Fuller test

-Do a train test split

-Apply the ARIMA / SARIMA / SARIMAX models and find the best fit for data.

## Result

The key finding of this project is that real world time-series data is prone to having seasonality and effect from exogenous factors, which is why SARIMAX model gives us the closest fit on test data.

## Tools

`Python` · `pandas` · `matplotlib` · `statsmodels.tsa`
