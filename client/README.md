# End-to-end Testing
Keep playwright version at 1.54.1 despite the warning; otherwise it does not work on my machine.

To run end-to-end testing with playwright, run:
```
npx playwright test
```

You might need to set things up beforehand. Do whatever installation command playwright tells you to do. Try not to `npm init playwright`, but if you do, don't push `package*.json`. Please.