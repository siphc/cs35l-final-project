# READ ME BEFORE YOU PUSH!!!
We have a GitHub Project set up to track our progress throughout the course of this project. Please utilize it by doing the following:
- **Do NOT push to `main`!!!**
- Doing all your development work on a branch (for example, I created the branch `example-branch` for this commit)
  - If you want, you can name your branch either on the feature you're currently implementing (e.g. `frontend-authentication` or `hotfix`), or you can name it after your username (e.g. `siphc`) and keep the branch after merging.
- Submitting a [Pull Request](https://github.com/siphc/cs35l-final-project/pulls) to `main` from your branch after your commit and push to **your branch** (for example, `origin/example-branch` for this commit)
  - Specify the [Issue](https://github.com/siphc/cs35l-final-project/issues) you are addressing with your PR. Your PR should more or less resolve the entire issue.
- Ask a team member to review your PR (which should include testing) and **squash-merge** the PR. This combines all the relevant commits into one commit which takes the name of the PR, so give your PRs a meaningful name. We do this to avoid cluttering.
- The Project automation is set up such that if you merge a PR that closes an Issue affiliated with a Project Item, the Item is automatically marked as done.

# Setup steps
Clone the directory:
```
git clone git@github.com:siphc/cs35l-final-project.git
```
### Frontend
After cloning the directory, run:
```
cd cs35l-final-project/client/
npm install
```
To install the Node.js package dependencies.

To test the web application, run:
```
npm run dev
```
### Backend
Navigate to the `server/` directory, and run:
```
npm install
```
To run the server, run:
```
node app.js
```
