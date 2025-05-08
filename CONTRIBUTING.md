# Contributing to AirTap Android JavaScript SDK

Thank you for your interest in contributing to the AirTap Android JavaScript SDK! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to foster an open and welcoming environment.

## How to Contribute

There are many ways to contribute to this project:

1. **Report Bugs**: If you find a bug, please create an issue with detailed information about how to reproduce it.
2. **Suggest Features**: Have an idea for a new feature? Open an issue to discuss it.
3. **Submit Pull Requests**: Want to fix a bug or implement a feature? Submit a pull request.

## Development Setup

1. **Fork and Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/airtap-android-js.git
   cd airtap-android-js
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file with your AirTap API key:
   ```
   AIRTAP_API_KEY=your_api_key_here
   ```

## Pull Request Process

1. **Create a Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**: Implement your changes, adhering to the coding style of the project.

3. **Write Tests**: Add tests for your changes to ensure they work as expected.

4. **Run Tests**: Make sure all tests pass:
   ```bash
   npm test
   ```

5. **Update Documentation**: Update any relevant documentation, including the README if necessary.

6. **Submit a Pull Request**: Push your changes to your fork and submit a pull request to the main repository.

## Coding Standards

- Follow the JavaScript Standard Style.
- Write clear, concise, and descriptive commit messages.
- Document your code with JSDoc comments.
- Keep functions small and focused on a single responsibility.
- Write unit tests for all new functionality.

## Release Process

The maintainers will handle the release process, which includes:

1. Updating the version number in `package.json`.
2. Creating a new release tag on GitHub.
3. Publishing the package to npm.
4. Updating the CHANGELOG.md file.

## License

By contributing to this project, you agree that your contributions will be licensed under the project's MIT License.

Thank you for your contributions!
