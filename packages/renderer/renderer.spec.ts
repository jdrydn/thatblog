import { describe, expect, it } from 'vitest';
import { createRenderer, type TemplateLoader } from './index';

// An in-memory loader keeps the renderer test independent of any theme on disk: it exercises the
// LiquidJS wiring (layout, partials, filters, missing-template errors) against a fixed template map.
const memoryLoader = (files: Record<string, string>): TemplateLoader => ({
  readFile: async (path) => {
    const src = files[path];
    if (src === undefined) throw new Error(`ENOENT: ${path}`);
    return src;
  },
  exists: async (path) => path in files,
});

describe('createRenderer', () => {
  it('renders a template with its view model', async () => {
    const renderer = createRenderer(memoryLoader({ 'hello.liquid': 'Hi {{ name }}' }));
    expect(await renderer.render('hello', { name: 'James' })).toBe('Hi James');
  });

  it('resolves a layout and a nested partial through the loader', async () => {
    const renderer = createRenderer(
      memoryLoader({
        'layout.liquid': '<main>{% block content %}{% endblock %}</main>',
        'page.liquid':
          "{% layout 'layout' %}{% block content %}{% render 'partials/card', title: title %}{% endblock %}",
        'partials/card.liquid': '<h1>{{ title }}</h1>',
      }),
    );
    expect(await renderer.render('page', { title: 'Post' })).toBe('<main><h1>Post</h1></main>');
  });

  it('surfaces a missing template as an error', async () => {
    const renderer = createRenderer(memoryLoader({}));
    await expect(renderer.render('nope', {})).rejects.toThrow();
  });
});
