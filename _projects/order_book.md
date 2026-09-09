---
title: "Order Book Simulator & Matching Engine"
summary: "A limit order book and matching engine built from scratch in Python, with a market-making and execution layer used to investigate where market-maker P&L actually comes from."
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

An energy trading analyst looks at the order book on a live trading screen all day and rarely looks inside it. GB power clears through three different mechanisms: continuous intraday on EPEX SPOT and N2EX (price-time priority), day-ahead as a uniform-price auction, and the Balancing Mechanism as pay-as-bid. Three sets of incentives, and it is entirely possible to trade all three for years while treating the matching itself as a black box.

This project opens the box. It implements the continuous double auction from first principles, the mechanism behind intraday power and equities on virtually every lit venue, and then uses it as an experiment rig for two questions:

1. With nobody informed, where does a market maker's P&L actually come from?
2. When a public wind forecast revision lands and desks disagree about what it means, what does that disagreement cost the maker, and does reacting faster help?

The second question is the interesting one, and the answer came out opposite to what the experiment was designed to find.

## What I built
- A matching engine with strict price-time (FIFO) priority: limit and market orders, partial fills, multi-level sweeps, cancel/replace, stop and stop-limit triggering. Pure Python standard library, no external dependencies in the engine itself.
- Data structures chosen for real complexity guarantees: a `deque` per price level for O(1) fills at both ends, a heap for O(log n) best-price lookup, and lazy deletion for O(1) cancels whose cleanup cost amortises away rather than accumulating.
- A strategy layer: a `MarketMaker` quoting around mid or around its own fair-value estimate, with an inventory cap and a post-only mode, plus a `TWAPExecutor` measuring slippage against arrival price, and weighted-average-cost P&L with a realized and unrealized split.
- A power-market layer: a convex piecewise-linear merit-order stack, public wind forecast revisions, and informed desks that each rerun the stack and arrive at their own number at their own speed.
- A Monte Carlo harness using common random numbers, so every cell of a parameter sweep faces an identical market.

## Finding one: a round trip only pays if the spread covers the drift

I expected the market maker to print money. In a market where nobody holds a view on price there is no one to be adversely selected by, so the spread should have been free. It lost money.

Working out why produced a testable prediction rather than a fitted curve. Define coverage as round-trip width divided by the price drift between the two legs. Across 200 seeded markets, realized P&L changes sign as coverage crosses 1.0, which is arithmetic confirmed by simulation rather than a pattern found in the data.

<figure class="project-figure">
  <img src="{{ '/assets/images/projects/coverage_crossing.png' | relative_url }}" alt="Realized P&L against coverage">
  <figcaption>Realized P&L flips sign as coverage crosses 1.0</figcaption>
</figure>

You cannot widen your way to safety. A wider quote is hit less often, so the holding period lengthens and the drift it must cover grows with the square root of that. Coverage peaks and then falls, which makes market making a two-sided optimisation: too tight and every round trip loses, too wide and nothing trades. Even at the optimum, 45% of individual markets still lose money. The median makes money; individual outcomes frequently do not.

None of it involves an informed trader.

## Finding two: what matters is whether desks agree, not how fast you react

A wind forecast revision is the cleanest public information event in GB power. A new run lands, every desk reruns its stack model, and the market reprices. Two things about that are missing from the textbook adverse-selection picture: desks do not get the same number, and they do not get it at the same time.

So informed flow after a public event is not one trader holding the truth. It is several desks holding several different estimates, arriving staggered. That gives two axes, and they are the experiment: how widely desk views scatter, and how many steps the market maker waits before moving its quote.

<figure class="project-figure">
  <img src="{{ '/assets/images/projects/grid_heatmap.png' | relative_url }}" alt="600 runs. Six reaction lags across five levels of disagreement, at 20 seeds per cell.">
  <figcaption>600 runs. Six reaction lags across five levels of disagreement, at 20 seeds per cell.</figcaption>
</figure>

Read the grid down a column and the markout flips sign, from +0.43 under tight agreement to -0.12 under wide disagreement. Read it across a row and almost nothing happens. Net P&L moves by a factor of ten over the same range, and the gradient is near identical down all six lag columns.

The mechanism is reversion to consensus. Wide disagreement means outliers: the maker sells to the desks that are too optimistic, buys from the ones that are too pessimistic, and gets paid as both are pulled back. Tight agreement offers no outliers to trade against, so every desk pushes the same way and the maker is on the wrong side of all of it.

A market maker should fear the forecast everyone reads alike, not the big one.

Reaction speed matters only when desks agree, and the experiment was designed around locating an optimal lag. There is not one. Waiting longer means averaging more desks before committing, so speed genuinely costs information, but that trade-off never binds anywhere in the grid.

## The part that nearly killed it

Disagreement generates trading. Trading consumes resting liquidity. So sweeping disagreement was also, silently, sweeping the depth of the book, by 74% end to end. The cells of the sweep were not the same market, and a thinner book reprices faster, so a fixed measurement horizon was capturing liquidity as much as flow.

My first attempt at a control changed two things at once, raising both the cancellation rate and the arrival rate. It left 37% depth variation and diluted the signal until it disappeared. I concluded the finding was dead and wrote it off.

The correct control changes one thing: a 2% per-step cancellation probability on noise orders, with everything else untouched. Depth variation falls to 6%, and the effect grows 2.9 times.

<figure class="project-figure">
  <img src="{{ '/assets/images/projects/confound.png' | relative_url }}" alt="Left, book depth against the treatment variable. Right, the measurement under both conditions.">
  <figcaption>Left, book depth against the treatment variable. Right, the measurement under both conditions.</figcaption>
</figure>

The confound was masking the effect, not creating it. A book holding 10,000 MWh barely moves when informed flow hits it, so every measurement was damped toward zero. That is not the failure mode you go looking for. The standard worry is that a confound has manufactured a result you wanted to believe, and the standard remedy is to control it and watch the effect shrink.

## What I would flag about it

- Simulation only, synthetic data. The flow model is a zero-intelligence baseline with Gaussian increments, so no fat tails and no volatility clustering, both of which power prices exhibit violently.
- 20 seeds per grid cell. The row-to-row gradient is far larger than the within-row scatter, but the within-row differences are not resolved, and the code reports those rows as flat rather than naming a best lag.
- Two negative results are recorded rather than buried: no interior optimum in reaction lag, and no separation in how fast a revision gets priced in at different levels of disagreement.
- 95 tests. The ones that earn their keep are invariants: `cash + position × mark == total P&L` after every fill, and `abs(position) <= cap` on every step of a 400-step run.
- Built with AI assistance. The direction, the domain framing and the verification were mine, and that verification is what caught a lookahead bug in the market maker's consensus and reversed a wrong conclusion about the confound.
- Views are my own.

## Tools

`Python` , `Matching engine (heap + deque, lazy deletion)` , `Monte Carlo simulation` , `pytest` , `matplotlib`,`Event-study design and confound control`