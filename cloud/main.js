// It is best practise to organize your cloud functions group into their own file. You can then import them in your main.js.
await Promise.all([import('./functions.js')]);
