const form = document.getElementById('generatorForm');
const output = document.getElementById('output');
const statusBar = document.getElementById('statusBar');
const copyButton = document.getElementById('copyOutput');
const downloadButton = document.getElementById('downloadText');
const saveHistoryButton = document.getElementById('saveHistory');
const promptPreview = document.getElementById('promptPreview');
const historyList = document.getElementById('historyList');
const clearFormButton = document.getElementById('clearForm');
const scrollToFormButton = document.getElementById('scrollToForm');

const localHistoryKey = 'ai-content-generator-history';
let currentText = '';

const templates = {
  blog: {
    title: 'Write a {tone} blog article about {keywords} for {audience}.',
    content: [
      'Start with a strong opening that explains why {keywords} matter to {audience}.',
      'Add a persuasive explanation of the most important benefits and practical steps they can follow.',
      'Use clear headings, real-world examples, and a confident call-to-action.',
    ],
  },
  ad: {
    title: 'Create a {tone} ad copy for {keywords} targeting {audience}.',
    content: [
      'Open with a compelling value statement that captures attention quickly.',
      'Describe the problem and position the product as the simplest solution.',
      'End with a direct call-to-action that encourages immediate response.',
    ],
  },
  email: {
    title: 'Draft a {tone} marketing email about {keywords} for {audience}.',
    content: [
      'Start with a friendly greeting and a relatable opening line.',
      'Introduce the main benefit and show why it matters today.',
      'Finish with a strong offer and a direct call-to-action.',
    ],
  },
  social: {
    title: 'Write a {tone} social media post about {keywords} for {audience}.',
    content: [
      'Lead with a shareable hook that feels immediate and relevant.',
      'Add short bullet-style benefit statements or emotional reasons.',
      'Finish with a memorable call-to-action or an invitation to engage.',
    ],
  },
  landing: {
    title: 'Generate a {tone} landing page intro for {keywords} aimed at {audience}.',
    content: [
      'Create a headline that highlights the biggest benefit of the offer.',
      'Explain the promise clearly and use persuasive supporting details.',
      'Close with a trustworthy call-to-action that feels easy to act on.',
    ],
  },
  chatbot: {
    title: 'Compose a {tone} AI chatbot script for {audience} that uses {keywords} and {brandVoice} persona.',
    content: [
      'Open with a friendly welcome message that feels human and helpful.',
      'Provide concise options or answers aligned to the user goal.',
      'Keep the flow natural, conversational, and easy to follow.',
    ],
  },
  product: {
    title: 'Write a {tone} product description for {keywords} aimed at {audience}.',
    content: [
      'Highlight the main product benefits and unique features.',
      'Use sensory language that helps the reader imagine the experience.',
      'Close with a persuasive line that encourages purchase or inquiry.',
    ],
  },
  seo: {
    title: 'Generate a {tone} SEO landing page for {keywords} that converts {audience}.',
    content: [
      'Create a headline that targets search intent and communicates value.',
      'Include benefits, pain points, and a clear solution statement.',
      'Finish with a CTA focused on action and trust-building details.',
    ],
  },
  press: {
    title: 'Draft a {tone} press release about {keywords} for {audience}.',
    content: [
      'Begin with the newsworthy announcement and key details.',
      'Explain why this matters and include supporting facts.',
      'Close with a quote-style summary and next step for readers.',
    ],
  },
  caseStudy: {
    title: 'Create a {tone} case study about {keywords} for {audience}.',
    content: [
      'Open with the challenge and the result achieved.',
      'Include measurable outcomes and business impact.',
      'End with lessons learned and a subtle call-to-action.',
    ],
  },
  video: {
    title: 'Write a {tone} video script about {keywords} for {audience}.',
    content: [
      'Start with a hook that captures attention in the first 5 seconds.',
      'Guide the viewer through benefits and next steps with clear pacing.',
      'End with a strong visual CTA and closing tagline.',
    ],
  },
  podcast: {
    title: 'Outline a {tone} podcast episode on {keywords} for {audience}.',
    content: [
      'Introduce the episode topic and why it matters now.',
      'Break the content into engaging segments with conversational flow.',
      'Close with a takeaway and listener engagement prompt.',
    ],
  },
  course: {
    title: 'Develop a {tone} course outline about {keywords} for {audience}.',
    content: [
      'Provide a clear course overview with learning outcomes.',
      'Add module-level topics and practical student takeaways.',
      'Finish with a call-to-action for enrollment or next steps.',
    ],
  },
  whitepaper: {
    title: 'Write a {tone} whitepaper about {keywords} for {audience}.',
    content: [
      'Open with the key problem and the high-level solution.',
      'Provide data-driven insights, evidence, and expertise.',
      'Conclude with a strong recommendation and next step.',
    ],
  },
};

const tones = {
  professional: 'professional and polished',
  friendly: 'friendly, warm, and conversational',
  energetic: 'energetic and motivating',
  luxury: 'luxurious and high-end',
  bold: 'bold, direct, and confident',
};

function setStatus(message, type = 'info') {
  statusBar.textContent = message;
  statusBar.style.color = type === 'error' ? '#ffb3b3' : '#c8c6ec';
}

function getFormValues() {
  return {
    contentType: document.getElementById('contentType').value,
    outputStyle: document.getElementById('outputStyle').value,
    tone: document.getElementById('tone').value,
    brandVoice: document.getElementById('brandVoice').value,
    audience: document.getElementById('audience').value.trim(),
    keywords: document.getElementById('keywords').value.trim(),
    language: document.getElementById('language').value,
    goal: document.getElementById('goal').value,
    depth: document.getElementById('depth').value,
    length: document.getElementById('length').value,
    customPrompt: document.getElementById('customPrompt').value,
    apiKey: document.getElementById('apiKey').value.trim(),
    includeSeo: document.getElementById('includeSeo').checked,
    includeCta: document.getElementById('includeCta').checked,
  };
}

function updatePromptPreview() {
  const values = getFormValues();
  promptPreview.textContent = buildPrompt(values);
}

function buildPrompt(values) {
  const template = templates[values.contentType] || templates.blog;
  const title = template.title
    .replace('{tone}', tones[values.tone] || values.tone)
    .replace('{keywords}', values.keywords || 'your topic')
    .replace('{audience}', values.audience || 'your audience')
    .replace('{outputStyle}', values.outputStyle || 'classic')
    .replace('{brandVoice}', values.brandVoice || 'trustworthy');

  const sections = template.content.map((line) =>
    line
      .replace('{tone}', tones[values.tone] || values.tone)
      .replace('{keywords}', values.keywords || 'your topic')
      .replace('{audience}', values.audience || 'your audience')
      .replace('{outputStyle}', values.outputStyle || 'classic')
      .replace('{brandVoice}', values.brandVoice || 'trustworthy')
  );

  const goalPhrases = {
    convert: 'Focus on increasing conversions with persuasive messaging.',
    educate: 'Focus on educating the audience with clear, useful information.',
    entertain: 'Focus on entertaining and engaging the reader with lively content.',
    inform: 'Focus on informing the audience and building trust.',
    launch: 'Focus on launching a product or campaign with strong positioning.',
  };

  const details = [];
  if (values.includeSeo) details.push('Include SEO-friendly headings, keywords, and a search-optimized structure.');
  if (values.includeCta) details.push('End with a direct call-to-action that encourages the reader to act immediately.');
  if (values.brandVoice) details.push(`Use a ${values.brandVoice} brand voice throughout the content.`);
  if (values.language) details.push(`Write the final output in ${values.language}.`);
  if (values.goal) details.push(goalPhrases[values.goal]);
  if (values.depth === 'short') details.push('Keep the output concise and high-impact.');
  if (values.depth === 'medium') details.push('Provide a balanced explanation with useful detail.');
  if (values.depth === 'long') details.push('Expand the content with additional detail, examples, and structure.');
  if (values.depth === 'epic') details.push('Develop a long-form, comprehensive version with rich examples and depth.');

  let prompt = `${title}\n\n${sections.join(' ')}\n\nWrite approximately ${values.length} words in a ${tones[values.tone] || values.tone} style.`;
  if (details.length) prompt += ` ${details.join(' ')}`;
  if (values.customPrompt.trim()) {
    prompt += ` Additional guidance: ${values.customPrompt.trim()}`;
  }
  prompt += ' Keep the output crisp, polished, and ready for publishing.';
  return prompt;
}

function localGenerator(values) {
  const prompt = buildPrompt(values);
  const baseCount = Math.max(2, Math.round(values.length / 180));
  const depthMap = {
    short: 1,
    medium: 2,
    long: 3,
    epic: 4,
  };
  const paragraphCount = Math.min(8, baseCount + (depthMap[values.depth] || 2));
  const paragraphs = [];

  paragraphs.push(`This ${values.outputStyle} content is crafted for ${values.audience || 'your audience'} and focuses on ${values.keywords || 'your topic'} with a ${values.brandVoice} brand voice.`);
  paragraphs.push(`It uses a ${tones[values.tone] || values.tone} tone to make the message feel both persuasive and easy to follow.`);

  for (let i = 2; i < paragraphCount; i += 1) {
    paragraphs.push(`It amplifies the core message with practical examples, strong benefits, and clear next-step guidance for the reader.`);
  }

  let generated = `${prompt}\n\n${paragraphCount === 0 ? '' : paragraphs.join('\n\n')}`;
  if (values.includeCta) {
    generated += '\n\nReady to take the next step? Use this content to engage your audience and drive results.';
  }
  return generated;
}

async function fetchOpenAI(prompt, apiKey, values) {
  const temperature = Math.min(1, Math.max(0.3, (values.creativity || 7) / 12));
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a top-tier marketing copywriter and content strategist.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'OpenAI request failed.');
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

function loadHistory() {
  const saved = localStorage.getItem(localHistoryKey);
  if (!saved) {
    historyList.innerHTML = '<div class="history-empty">No saved content yet. Generate something amazing.</div>';
    return [];
  }

  try {
    const items = JSON.parse(saved);
    if (!Array.isArray(items)) throw new Error('Invalid history');
    return items;
  } catch {
    localStorage.removeItem(localHistoryKey);
    historyList.innerHTML = '<div class="history-empty">No saved content yet. Generate something amazing.</div>';
    return [];
  }
}

function renderHistory() {
  const items = loadHistory();
  if (items.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No saved content yet. Generate something amazing.</div>';
    return;
  }

  historyList.innerHTML = items
    .slice()
    .reverse()
    .map((item, index) => {
      const label = `${item.type} | ${item.outputStyle || 'Classic'} | ${item.brandVoice || 'Brand Voice'} | ${item.tone}`;
      const metadata = `${item.language || 'English'} • ${item.goal || 'convert'} • ${item.depth || 'medium'}`;
      const dateLabel = new Date(item.createdAt).toLocaleString();
      return `
        <div class="history-item">
          <h4>${label}</h4>
          <small>${metadata} • ${dateLabel}</small>
          <p>${item.content.replace(/\n/g, '<br/>')}</p>
          <div class="history-actions">
            <button class="button button-secondary" data-copy="${index}">Copy</button>
            <button class="button button-secondary" data-load="${index}">Load</button>
          </div>
        </div>
      `;
    })
    .join('');
}

function saveToHistoryItem(text, values) {
  if (!text.trim()) {
    setStatus('Nothing to save yet.', 'error');
    return;
  }

  const items = loadHistory();
  items.push({
    type: values.contentType,
    outputStyle: values.outputStyle || 'classic',
    tone: values.tone,
    brandVoice: values.brandVoice || 'trustworthy',
    language: values.language || 'English',
    goal: values.goal || 'convert',
    depth: values.depth || 'medium',
    content: text,
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(localHistoryKey, JSON.stringify(items.slice(-50)));
  renderHistory();
  setStatus('Saved output to history.');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const values = getFormValues();
  const prompt = buildPrompt(values);
  setStatus('Generating content...', 'info');
  output.textContent = 'Generating content...';

  try {
    let result;
    if (values.apiKey) {
      result = await fetchOpenAI(prompt, values.apiKey, values);
    } else {
      result = localGenerator(values);
      setStatus('Generated draft without API key. Add a valid OpenAI key for premium polish.');
    }

    currentText = result;
    output.textContent = result;
    setStatus('Content generated successfully.');
  } catch (error) {
    output.textContent = error.message || 'An error occurred during generation.';
    setStatus(`Error: ${error.message || 'Generation failed.'}`, 'error');
  }
});

copyButton.addEventListener('click', async () => {
  if (!currentText.trim()) {
    setStatus('No content to copy.', 'error');
    return;
  }

  await navigator.clipboard.writeText(currentText);
  setStatus('Copied content to clipboard.');
});

downloadButton.addEventListener('click', () => {
  if (!currentText.trim()) {
    setStatus('No content available to download.', 'error');
    return;
  }

  const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'ai-content.txt';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  setStatus('Downloaded generated content as text file.');
});

saveHistoryButton.addEventListener('click', () => {
  if (!currentText.trim()) {
    setStatus('No content to save yet.', 'error');
    return;
  }

  const values = getFormValues();
  saveToHistoryItem(currentText, values);
});

clearFormButton.addEventListener('click', () => {
  form.reset();
  document.getElementById('creativity').value = '7';
  document.getElementById('length').value = '350';
  output.textContent = 'Your generated content appears here after you click Generate.';
  currentText = '';
  setStatus('Form reset. Ready for your next idea.');
});

scrollToFormButton.addEventListener('click', () => {
  document.getElementById('generator').scrollIntoView({ behavior: 'smooth' });
});

historyList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const index = Number(button.dataset.copy ?? button.dataset.load);
  const items = loadHistory();
  const actualIndex = items.length - 1 - index;
  const item = items[actualIndex];
  if (!item) return;

  if (button.dataset.copy !== undefined) {
    await navigator.clipboard.writeText(item.content);
    setStatus('Copied history item to clipboard.');
  } else if (button.dataset.load !== undefined) {
    output.textContent = item.content;
    currentText = item.content;
    setStatus('Loaded history item into the editor.');
  }
});

window.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  updatePromptPreview();

  const inputs = document.querySelectorAll('#generatorForm input, #generatorForm select, #generatorForm textarea');
  inputs.forEach((input) => {
    input.addEventListener('input', updatePromptPreview);
    input.addEventListener('change', updatePromptPreview);
  });
});
