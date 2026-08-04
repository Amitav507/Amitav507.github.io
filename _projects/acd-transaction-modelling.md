---
title: "Modelling Irregular Financial Transactions with ACD"
summary: "MSc dissertation: modelling stock trade timing as a stochastic process using Autoregressive Conditional Duration models, comparing 4 approaches on real LSE transactions."
category: "MSc Dissertation"
tags: [R, Time-Series, Stochastic Modelling, Market Microstructure]
spark_color: "#57D9C7"
sparkline: "M0,30 C20,32 30,10 50,15 C70,20 80,5 100,8 C120,10 140,3 160,6 C180,8 190,2 200,4"
repo_url: "https://github.com/Amitav507/Modelling-Irregular-Financial-Transactions-with-Autoregressive-Conditional-Durations"
order: 0
image: "/assets/images/projects/ACD_results.png"
# image_alt: "Hazard function plot comparing empirical and parametric estimates"
---

## The problem

Most time-series forecasting assumes data arrives at fixed intervals — daily closes, hourly
prices. Real trade data doesn't: transactions on a stock can be seconds apart during a busy open,
then minutes apart in a quiet mid-session lull. Aggregating to a fixed interval to make the data
"regular" throws away exactly the information that matters — *when* trades cluster is itself a
signal of informed trading and liquidity conditions.

The goal: model the **time between trades** directly as a random variable, rather than forcing
irregular data into a regular grid, using 147,592 real transactions for Lloyds Banking Group
(LSE: LLOY) across a full month of trading.

## Approach

- Implemented the **Autoregressive Conditional Duration (ACD)** framework (Engle & Russell,
  1998) in R, fitting 4 model families across 8 specifications: Exponential ACD, Weibull ACD,
  Generalised Gamma ACD, and Log-Weibull ACD (a second-generation variant).
- Applied **diurnal adjustment** via cubic spline to strip out the mechanical U-shaped
  intraday pattern (heavy trading at open/close, quiet mid-session) before modelling the
  stochastic component.
- Validated inter-temporal dependence with ACF/PACF plots and the Ljung-Box test before *and*
  after fitting, to confirm each model was actually absorbing the autocorrelation it was built to
  capture.
- Compared all 8 models on **log-likelihood, AIC, BIC, and MSE** — deliberately using both a
  raw fit measure and penalised criteria, since the more flexible models (more parameters) will
  always look better on log-likelihood alone.
- Extended the approach to model **cumulative trading volume durations**, testing whether the
  same framework explains volume clustering, not just trade-count clustering.

## Result

- **GGACD(3,2)** was the best-fitting model on log-likelihood, AIC, and BIC — even after
  penalising for its extra parameters.
- **WACD(2,2)** gave the cleanest residuals (lowest MSE, least leftover autocorrelation) — a
  genuine fit-vs-parsimony trade-off, not just "one model wins."
- Every model estimated the sum of its autoregressive coefficients at **~0.98–0.99**, meaning
  trade timing is highly persistent: a burst or lull in trading activity takes a long time to fade,
  not just noise from one trade to the next.
- The volume-duration extension showed that **volume clustering follows the same intraday
  pattern as trade clustering** — direct evidence for the market microstructure theory that
  informed trading concentrates at the open and close, which is exactly the kind of intraday
  liquidity signal that matters for execution timing in any market, not just equities.

## Tools

`R` · `ACDm package` · `Maximum Likelihood Estimation` · `Time-series diagnostics (ACF/PACF, Ljung-Box)`
