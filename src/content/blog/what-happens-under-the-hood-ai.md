---
title: "What Happens Under the Hood When You Send a Message to an AI"
description: "From tokenization and vector embeddings to probability distributions and iterative next-token prediction: a software engineer's guide to LLM inference."
pubDate: 2026-09-01
author: "Anderson Rodrigues"
tags: ["Artificial Intelligence", "LLMs", "Machine Learning", "Software Architecture", "Engineering"]
readTime: "4 min read"
---

Every time we send a message to a Large Language Model (LLM), something mathematically fascinating happens behind the scenes.

You type a sentence into a chat prompt, but the model doesn’t read it like a human. It doesn't lookup a pre-written database entry, nor does it search its internal memory for an exact answer.

Here is the step-by-step pipeline of what is actually happening when you press Enter:

---

## The 9 Steps of LLM Inference

![What Happens Under the Hood When We Send a Message to an AI](/what-happens-under-the-hood-ai.png)

### 1. Text Input & Tokenization
The raw string message is broken down into smaller chunks called **tokens**. A token can be a word, part of a word, or punctuation (e.g., `"Explain how AI works."` becomes `["Explain", " how", " AI", " works", "."]`).

### 2. Numerical Identifiers (Token IDs)
Neural networks cannot process raw strings directly. Each unique token in the model's vocabulary is mapped to an integer ID (e.g., `3412`, `612`, `1827`, `2456`, `13`).

### 3. Vector Embeddings
Token IDs are converted into high-dimensional mathematical vectors (embeddings). These vectors capture semantic meaning, grammatical relationships, and contextual distance in a multi-dimensional latent space.

### 4. Neural Network Parameter Pass
The vectors pass through billions of parameter weights (trained during pre-training). The attention mechanisms evaluate relationships between all preceding tokens in the context window.

### 5. Probability Distribution Calculation
Instead of querying an internal document, the model calculates probability distributions over its entire vocabulary for the single **next token**:
> *"Given everything that came before, what is the most mathematically likely next token?"*

### 6. Sampling & Token Selection
The most likely candidate token (or a sampled token based on temperature and top-p settings) is selected and appended to the response stream.

### 7. The Autoregressive Loop
The newly generated token is appended to the input prompt, becoming the new context. The entire process repeats, one single token at a time:

$$\text{Message} \longrightarrow \text{Tokens} \longrightarrow \text{Embeddings} \longrightarrow \text{Neural Network} \longrightarrow \text{Probabilities} \longrightarrow \text{Next Token}$$

---

## Key Takeaways for Engineers

- **No Database Lookup:** There is no tiny database inside writing the answer.
- **Probabilistic Generation:** The system learned language patterns, code structures, and reasoning heuristics across massive datasets to generate language probabilistically.
- **Simplicity vs Complexity:** The chat interface makes AI feel simple, but the system underneath relies on high-dimensional linear algebra and matrix multiplication at immense scale.

Understanding what happens when we press Enter allows us to build better prompts, design more resilient agentic workflows, and reason about context window limitations effectively.

---

*About the Author:* **Anderson Rodrigues** is a Senior Software Engineer at Nubank specializing in Clojure, Java, distributed systems, and AI engineering workflows.
