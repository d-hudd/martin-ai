self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    switch (label) {
      case 'json':
        return '/monaco/json.worker.js';
      case 'css':
        return '/monaco/css.worker.js';
      case 'html':
        return '/monaco/html.worker.js';
      case 'typescript':
      case 'javascript':
        return '/monaco/ts.worker.js';
      default:
        return '/monaco/editor.worker.js';
    }
  }
};
