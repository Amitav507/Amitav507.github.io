---
title: "Order Book Simulator & Matching Engine"
summary: "A limit order book and matching engine built from scratch in Python, with a market-making and execution layer — used to investigate where market-maker P&L actually comes from."
category: "Case Study"
tags: [Python, Market Microstructure, Matching Engine, Market Making]
spark_color: "#F2B84B"
sparkline: "M0,30 C25,28 40,32 60,20 C80,8 100,12 120,10 C140,8 160,4 180,6 200,3"
repo_url: "https://github.com/Amitav507/order-book-simulator"
order: -1
image: "/assets/images/projects/depth_ladder.png"
# image_alt: "Realized market-maker P&L plotted against spread coverage ratio"
---

## The problem

An energy trading analyst looks at the order book on a live trading screen but rarely looks *inside* it. GB power
clears through three different mechanisms — continuous intraday on EPEX SPOT and N2EX
(price-time priority), day-ahead as a uniform-price auction, and the Balancing Mechanism as
pay-as-bid — each with genuinely different incentives. It's easy to trade all three for years while
treating the matching itself as a black box.

This project opens the box: implementing the continuous double auction — the mechanism behind
intraday power and equities on virtually every lit venue — from first principles, then using it to
answer the question that actually matters on a desk: *where does the P&L come from, and what
does execution cost?*

## Approach

- Built a **matching engine** with strict price-time (FIFO) priority: limit and market orders,
  partial fills, multi-level sweeps, cancel/replace, and stop / stop-limit triggering — pure
  Python standard library, no external dependencies in the engine itself.
- Designed the core data structures for real complexity guarantees: a `deque` per price level for
  O(1) fills at both ends, a heap for O(log n) best-price lookup, and **lazy deletion** for O(1)
  cancels that amortise their cleanup cost away rather than accumulating it.
- Added a **strategy and execution layer**: a `MarketMaker` quoting a two-sided spread with an
  optional inventory cap, a `TWAPExecutor` measuring slippage against arrival price (transaction
  cost analysis), and weighted-average-cost P&L accounting with realized/unrealized split and
  max drawdown.
- Drove the book with seeded synthetic order flow and ran a **Monte Carlo sweep** across 200
  markets, varying quoted spread width to isolate what makes a market-making round trip
  actually profitable.

## Result

- The headline finding came from being wrong. I expected the market maker to print money —
  in a market where nobody holds a view on price, there's no one to be adversely selected by, so
  the spread should be free. **It lost money.**
- Working out why produced a testable prediction: a round trip only pays if the spread covers the
  price drift between its two legs. Defining *coverage* as round-trip width ÷ drift, **realized P&L
  changes sign as coverage crosses 1.0** — a result derived from arithmetic, not fitted to the
  data, and then confirmed by the simulation.
- But you can't widen your way to safety: a wider quote is hit less often, so the holding period
  lengthens and the drift it must cover grows with the square root of time. Coverage peaks and
  then *falls* — making market making a genuine two-sided optimisation, too tight and every
  round trip loses, too wide and nothing trades.
- Even at the optimum, **45% of individual markets still lose money** — the median makes money,
  individual outcomes frequently don't. None of it involving an informed trader.
- Backed by **54 tests**, the most valuable being invariants: `cash + position × mark == total P&L`
  after every fill, and `abs(position) <= cap` on every step of a 400-step run.

## Tools

`Python` · `Matching engine (heap + deque, lazy deletion)` · `Monte Carlo simulation` · `pytest` · `matplotlib`