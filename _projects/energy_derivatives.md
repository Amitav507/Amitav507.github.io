---
title: "Energy & Commodity Derivatives Pricing Library"
summary: "An open-source Python library pricing energy and commodity options: Black-76 for options on forwards, analytic Greeks, implied vol, and Monte Carlo, with a section on exactly where the lognormal model breaks on power."
category: "Case Study"
tags: [Python, Derivatives Pricing, Black-76, Monte Carlo, Energy Markets]
spark_color: "#57D9C7"
sparkline: "M0,38 C25,36 45,30 65,26 C90,20 105,12 130,10 C155,8 175,5 200,4"
repo_url: "https://github.com/Amitav507/energy-derivatives-pricing"
order: -2
image: "/assets/images/projects/greek-profiles.png"
image_alt: "Delta, gamma and vega profiles across strikes under Black-76"
---

## The problem

Every energy option a desk actually trades is written on a forward or a future, not on spot. That one fact rules out the textbook model. Black-Scholes-Merton prices spot plus a cost of carry, and for a commodity that carry is financing plus storage minus convenience yield, which is unobservable and moves exactly when it matters. For power the framework collapses entirely, because power cannot be stored and there is no spot-forward arbitrage to define a carry at all.

So this project builds the model energy markets actually use, Black-76, from first principles: options on forwards and futures, full analytic Greeks, implied volatility, and Monte Carlo, with correctness checked three independent ways rather than against the library's own formulas. And then it goes looking for the point where its own core assumption stops being true on real power data.

## What I built

- A closed-form pricing core with no dependencies beyond the Python standard library: `Black76` for options on forwards and futures, `BlackScholes` for spot-based contracts with a continuous carry, full analytic Greeks, and a bracketed-Newton implied-volatility solver shared across both.
- A Monte Carlo engine (numpy) with antithetic sampling on by default, returning a price with a standard error and a 95% confidence interval, built both to cross-check the closed form and to reach payoffs that have no closed form.
- An optional market-data layer assembling real pricing inputs from free public sources: continuous futures from Yahoo Finance, rate curves from FRED, realized volatility from log returns, and EU day-ahead power from ENTSO-E.
- A command-line pricer and an end-to-end demo across several underlyings.

## Getting the Greeks right, not just the price

The headline figure is the Greek profiles across strikes, and three details in it matter more than the shapes.

<figure class="project-figure">
  <img src="{{ '/assets/images/projects/greek-profiles.png' | relative_url }}" alt="Delta, gamma and vega across strikes under Black-76">
  <figcaption>Delta tops out at the discount factor; gamma and vega peak above the forward</figcaption>
</figure>

Delta tops out at the discount factor, not at 1: under Black-76 delta is `e^(-rT)·N(d1)`, so even a call certain to be exercised reads 0.98, because the payoff arrives at expiry rather than today. At-the-money delta is 0.545, not the rule-of-thumb 0.50, and that gap widens with volatility and maturity, which is exactly where energy options live. Gamma and vega both peak above the forward and at the same strike, `K = F·exp(0.5 σ² T)`, which is the delta-neutral straddle that volatility surfaces quoted by delta use as their at-the-money convention.

There is a sign subtlety the library gets right that a naive shortcut does not. You can reproduce a Black-76 price by setting the dividend yield equal to the rate in a Black-Scholes engine, and four of the five Greeks come out identical, but rho comes out with the wrong sign, because that shortcut differentiates the rate while holding the dividend yield fixed. `Black76` is a real implementation rather than that substitution, and a test pins the difference.

## Validation: three independent routes, not self-reference

The core discipline of the project is that correctness is never checked against the library's own formulas.

Against a reference implementation: prices agree with `py_vollib` to 2.5e-14 across a 144-point grid of forward, strike, maturity and volatility, which is under two floating-point units, with the residual coming from the normal CDF (this library uses `math.erf`, py_vollib uses scipy).

Against simulation: Monte Carlo and the closed form are independent numerical routes to the same number, and the test asserts they agree within four standard errors, a statistical test rather than an arbitrary tolerance.

<figure class="project-figure">
  <img src="{{ '/assets/images/projects/mc-convergence.png' | relative_url }}" alt="Monte Carlo estimate converging on the Black-76 closed form as paths increase">
  <figcaption>The 2-standard-error band contains the closed form at every path count: the test passing, as a picture</figcaption>
</figure>

The estimate scatters to both sides of the closed form rather than creeping up from below, which is what an unbiased estimator looks like, and the band narrows as `1/sqrt(N)`, so a five-hundredfold rise in paths buys only a twentyfold cut in error. That cost structure is the whole reason closed forms are still worth having.

Against no-arbitrage identities: put-call parity in both spot and futures forms, price bounds, and Greek sign conditions. Two real pricing bugs were caught this way and documented in the tests, including a zero-volatility branch that returned undiscounted intrinsic value instead of the discounted payoff. 34 tests run in CI.

## Where the library stops working, on purpose

Everything above assumes prices are lognormal, which is what makes `ln(F/K)` meaningful and guarantees a positive underlying. On European power that assumption is simply false, and not as a tail curiosity.

<figure class="project-figure">
  <img src="{{ '/assets/images/projects/power-negative-prices.png' | relative_url }}" alt="Dutch and German day-ahead power prices settling at or below zero, against a fitted lognormal">
  <figcaption>Negative and zero settlements are 4.3% of Dutch and 5.6% of German quarter-hours; the lognormal assigns them probability zero</figcaption>
</figure>

Settlements at or below zero, driven by inflexible generation meeting low demand in high-renewable hours, make up 4.3% of Dutch and 5.6% of German quarter-hours across this window. A lognormal fitted to the positive observations assigns probability zero to every one of them, because its support is the strictly positive line. No recalibration fixes that: the support is wrong, not the parameters. The fit is poor across the positive region too, peaking near 45 EUR where the data peaks near 165, because the real shape is the merit order showing through. (These are Dutch and German markets rather than GB, because since Brexit GB day-ahead is not obtainable from free sources at all, which is itself documented in the data layer.)

The standard fix for negative prices is a Bachelier model, where the forward diffuses arithmetically and admits negative prices naturally, and this figure is the argument for why that comes before building a volatility surface. The known limitations are stated plainly in the repo rather than hidden: scalar volatility with no smile or term structure, realized rather than implied vol, European exercise only, vanilla payoffs only. The point of the project is to know exactly where each assumption binds.

## Tools

`Python` , `Black-76 / Black-Scholes-Merton` , `Analytic Greeks & implied vol` , `Monte Carlo (antithetic sampling)` , `numpy` , `pytest / CI` , `ENTSO-E, FRED, Yahoo Finance market data`
