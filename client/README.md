# End-to-end Testing
Keep playwright version at 1.54.1 despite the warning; otherwise it does not work on my machine.

To run end-to-end testing with playwright, run:
```
npx playwright test
```

Make sure you don't have a server instance running before you launch the test, otherwise the BeforeAll and AfterAll hooks won't work.

You might need to set things up beforehand. Do whatever installation command playwright tells you to do (I think it's `npx playwright install`). Try not to `npm init playwright`, but if you do, don't push `package*.json`. Please.

If you run Nix (literally only me), run `nix-shell` before executing the test.

---

**IF THE TEST FAILS ON FIRST TRY**, try again. Localhost might be responding slowly to actions done by Playwright. If the test fails again, try:
```
npx playwright test --ui
```
... and click the start button on the top-left.