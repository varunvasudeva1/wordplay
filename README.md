# Wordplay: On-Demand Text Games

An open-source CLI that lets you experience fun text-based games powered by large language models (LLMs).

## Features

- **Dynamic:** Questions and scenarios are generated in real-time by the models on your machine.
- **Customizable:** Where it applies, tailor games to your liking: trivia on what you like being quizzed on, the difficulty level you want to play a game at, etc.
- **Local & Private**: Runs on your machine, with the LLM endpoint of your choosing. Plug in a SoTA model via API or use your local models via Ollama.

## Getting Started

> [!NOTE] 
> Replace all parameters within `()` with actual values. For example, replace `(model)` with `gemma2:9b`.

1. Clone and navigate to repo
   ```bash
   git clone https://github.com/varunvasudeva1/wordplay-cli
   cd wordplay-cli
   ```

2. Install globally via `npm`
   ```bash
   sudo npm i -g
   ```

3. Configure the model and endpoint
   ```bash
   wordplay config -m (model) -e (endpoint)
   ```

4. Check available games
   ```bash
   wordplay list
   ```

5. Play!
   ```bash
   wordplay play (game)
   ```

## Updating

To update, simply pull changes and rebuild.

```bash
cd wordplay-cli
git pull
npm run build
```

## Games

- **Trivia:** Test your knowledge with 10 challenging questions across various topics and difficulties.
- **Hunt:** Embark on a perilous quest for buried treasure, making choices that will determine your fate, that will either end in success or death.
- **Scramble:** Find as many permutations of a scrambled word as possible.

> [!IMPORTANT]
> Using more capable models will make for a better experience - use the best one you can within your means, either via cloud API or locally.

## Acknowledgements

- [Text to ASCII Generator](http://www.patorjk.com/software/taag/#p=display&f=Graffiti&t=Type%20Something%20) courtesy of [patorjk.com](www.patorjk.com).
- [english-words](https://github.com/dwyl/english-words) master word list courtesy of [dwyl](https://github.com/dwyl) and contributors.
