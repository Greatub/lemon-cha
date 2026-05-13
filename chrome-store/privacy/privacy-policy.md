# lemon cha Privacy Policy

Last updated: May 13, 2026

## Overview

lemon cha is a browser AI chat extension that lets users connect their own LLM API providers or local Ollama models. lemon cha does not operate its own cloud inference service.

## Information stored locally

lemon cha stores the following data in browser extension local storage:

- Model provider settings
- API keys entered by the user
- Base URLs and model names
- Prompt presets
- Conversation history and folders
- Interface and feature preferences

This information remains in the user's browser unless the user exports it manually or removes it through the extension controls.

## Information transmitted

When a user sends a message, lemon cha transmits the content needed to fulfill that request to the model endpoint selected by the user. This may be:

- A third-party OpenAI-compatible API provider chosen by the user
- A local Ollama endpoint running on the user's machine

lemon cha does not proxy these requests through a lemon cha-owned server.

## API keys

API keys are stored locally in browser extension storage and are used only for authentication with the endpoint configured by the user.

## Remote code

lemon cha does not download or execute remotely hosted JavaScript or other remote code as part of the extension UI.

## Data sharing

lemon cha does not sell, rent, or share user data with lemon cha-owned third-party services. Data is sent only to the provider or local endpoint chosen by the user when the user initiates a model request.

## User controls

Users can:

- Delete individual conversations
- Clear conversation history
- Reset general settings
- Reset current model settings
- Reset current prompt preset
- Restore factory settings

These actions are performed locally in the extension.

## Security notes

Users are responsible for selecting and trusting their configured model provider. For third-party APIs, users should review the provider's own privacy and retention policies before sending sensitive information.
