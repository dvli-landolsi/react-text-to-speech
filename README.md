# Audio Transcribe - Text to Speech Converter

![Audio Transcribe Logo](public/logo.svg)

A modern, accessible text-to-speech converter built with React and TypeScript. This application runs entirely in your browser using native Web APIs - no AI services or external servers required.

## Features

- **Browser-Native Text to Speech**: Uses the Web Speech API for natural voice synthesis
- **Offline-Capable**: All processing happens locally in your browser
- **File Support**: Import text from PDF and DOCX files with client-side processing
- **Multi-language Support**:
  - English
  - French
  - Arabic
- **Playback Controls**:
  - Play/Stop functionality
  - Pause/Resume capability
  - Keyboard shortcuts (Cmd/Ctrl + Enter)
- **Auto Language Detection**: Client-side language detection using franc-min
- **Modern UI**: Clean, responsive interface with intuitive controls
- **Accessibility**: Built with web accessibility standards in mind

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- make (usually pre-installed on Unix-based systems)

### Quick Start

The project includes a Makefile for easy setup and running. Here are the basic commands:

```bash
# Install dependencies and run the application
make

# Just install dependencies
make install

# Start development server
make dev

# Build and run production version
make run

# Clean the installation
make clean

# Show all available commands
make help
```

### Manual Installation

If you prefer not to use make, you can run the commands directly:

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
npm run preview
```

### Available Make Commands

| Command        | Description                       |
| -------------- | --------------------------------- |
| `make install` | Install project dependencies      |
| `make dev`     | Start development server          |
| `make build`   | Build for production              |
| `make run`     | Build and start production server |
| `make clean`   | Remove all generated files        |
| `make help`    | Show available commands           |

## Technology Stack

### Core Framework

- **React 18**: UI component library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast development and building

### Browser APIs Used

- **Web Speech API**: Native browser text-to-speech synthesis
  - No external API calls or services required
  - Supports multiple languages and voices
  - Built-in pause/resume functionality

### Document Processing

- **PDF.js** (`pdfjs-dist`):

  - Mozilla's PDF rendering library
  - Client-side PDF text extraction
  - No server uploads needed

- **Mammoth.js** (`mammoth`):
  - DOCX file processing in the browser
  - Converts Word documents to clean text
  - Preserves basic formatting

### Language Detection

- **Franc-min**:
  - Lightweight language detection
  - Works entirely in the browser
  - Supports 82+ languages
  - Small bundle size (≈ 20KB)

## Usage

1. **Direct Text Input**:

   - Type or paste text into the textarea
   - Select desired language (or let it auto-detect)
   - Click "Convert to Audio" or use Cmd/Ctrl + Enter

2. **File Import**:

   - Click "Add New File"
   - Select PDF or DOCX file
   - Content will be automatically extracted locally
   - No file uploads required

3. **Playback Controls**:
   - Use "Stop" to end playback
   - "Pause/Resume" to control playback
   - Word count is displayed for reference

## Development Setup

The application uses environment variables for basic configuration:

```env
VITE_APP_TITLE=Audio Transcribe
VITE_APP_DESCRIPTION=Text to Speech Converter
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Future Enhancements

- Additional language support via Web Speech API
- Custom voice selection from available system voices
- Speech rate and pitch adjustment
- Batch processing for multiple files
- Progressive Web App (PWA) support for offline use
- Enhanced text formatting support

<p align="center">Built with native web technologies for privacy and performance</p>
