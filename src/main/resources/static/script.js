feather.replace();

// State
let chats = [];
let sections = [];
let records = [];
let selectedRecord = null;
let currentChatId = null;
let isDarkMode = localStorage.getItem('theme') === 'dark';
let warningsEnabled = localStorage.getItem('warnings') === 'true';
let deleteCallback = null;
let renameChatId = null;
let viewRecordId = null;

function initializeStorage() {
  try {
    const chatsData = localStorage.getItem('chats');
    console.log('Raw chats from localStorage:', chatsData);
    chats = chatsData ? JSON.parse(chatsData) : [];
    console.log('Parsed chats:', chats);

    const sectionsData = localStorage.getItem('sections');
    console.log('Raw sections from localStorage:', sectionsData);
    sections = sectionsData ? JSON.parse(sectionsData) : [];
    console.log('Parsed sections:', sections);

    const recordsData = localStorage.getItem('records');
    console.log('Raw records from localStorage:', recordsData);
    records = recordsData ? JSON.parse(recordsData) : [];
    console.log('Parsed records:', records);
  } catch (e) {
    console.error('Error parsing localStorage data:', e);
    chats = chats || [];
    sections = sections || [];
    records = records || [];
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem('chats', JSON.stringify(chats));
    localStorage.setItem('sections', JSON.stringify(sections));
    localStorage.setItem('records', JSON.stringify(records));
    console.log('Saved to localStorage:', { chats, sections, records });
    console.log('Verified chats in localStorage:', localStorage.getItem('chats'));
    console.log('Verified sections in localStorage:', localStorage.getItem('sections'));
    console.log('Verified records in localStorage:', localStorage.getItem('records'));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// Вызываем инициализацию
initializeStorage();

// DOM Elements
const leftSidebar = document.getElementById('left-sidebar');
const rightSidebar = document.getElementById('right-sidebar');
const toggleLeftSidebar = document.getElementById('toggle-left-sidebar');
const toggleRightSidebar = document.getElementById('toggle-right-sidebar');
const newChatBtn = document.getElementById('new-chat');
const chatList = document.getElementById('chat-list');
const newSectionBtn = document.getElementById('new-section');
const recordList = document.getElementById('record-list');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message');
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const toggleThemeBtn = document.getElementById('toggle-theme');
const warningsToggle = document.getElementById('warnings-toggle');
const closeSettings = document.getElementById('close-settings');
const warningModal = document.getElementById('warning-modal');
const closeWarningBtn = document.getElementById('close-warning');
const deleteConfirmModal = document.getElementById('delete-confirm-modal');
const deleteConfirmMessage = document.getElementById('delete-confirm-message');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const newSectionModal = document.getElementById('new-section-modal');
const sectionTitleInput = document.getElementById('section-title-input');
const saveSectionBtn = document.getElementById('save-section');
const cancelSectionBtn = document.getElementById('cancel-section');
const newRecordModal = document.getElementById('new-record-modal');
const recordSectionSelect = document.getElementById('record-section-select');
const recordTitleInput = document.getElementById('record-title-input');
const recordBodyInput = document.getElementById('record-body-input');
const saveRecordBtn = document.getElementById('save-record');
const cancelRecordBtn = document.getElementById('cancel-record');
const renameChatModal = document.getElementById('rename-chat-modal');
const chatTitleInput = document.getElementById('chat-title-input');
const saveChatTitleBtn = document.getElementById('save-chat-title');
const cancelChatTitleBtn = document.getElementById('cancel-chat-title');
const viewRecordModal = document.getElementById('view-record-modal');
const viewRecordContent = document.getElementById('view-record-content');
const editRecordForm = document.getElementById('edit-record-form');
const editRecordSectionSelect = document.getElementById('edit-record-section-select');
const editRecordTitleInput = document.getElementById('edit-record-title-input');
const editRecordBodyInput = document.getElementById('edit-record-body-input');
const saveEditRecordBtn = document.getElementById('save-edit-record');
const cancelEditRecordBtn = document.getElementById('cancel-edit-record');
const editRecordBtn = document.getElementById('edit-record-btn');
const closeViewRecordBtn = document.getElementById('close-view-record');

// Initialize
function initializeTheme() {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    toggleThemeBtn.textContent = 'Переключить на светлую';
  } else {
    document.documentElement.classList.remove('dark');
    toggleThemeBtn.textContent = 'Переключить на тёмную';
  }
}
initializeTheme();
warningsToggle.checked = warningsEnabled;
chatList.classList.add('chat-list-container');

// Sidebar Toggling
toggleLeftSidebar.addEventListener('click', () => {
  leftSidebar.classList.toggle('sidebar-hidden');
});

toggleRightSidebar.addEventListener('click', () => {
  rightSidebar.classList.toggle('sidebar-right-hidden');
});

// Settings Modal
settingsBtn.addEventListener('click', () => {
  settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
  settingsModal.classList.add('hidden');
});

// Theme Switching
toggleThemeBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    toggleThemeBtn.textContent = 'Переключить на светлую';
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    toggleThemeBtn.textContent = 'Переключить на тёмную';
    localStorage.setItem('theme', 'light');
  }
  saveToLocalStorage();
});

// Warnings Toggle
warningsToggle.addEventListener('change', () => {
  warningsEnabled = warningsToggle.checked;
  localStorage.setItem('warnings', warningsEnabled);
  saveToLocalStorage();
});

// Close Warning Modal
closeWarningBtn.addEventListener('click', () => {
  warningModal.classList.add('hidden');
});

// Delete Confirmation
function showDeleteConfirm(message, callback) {
  deleteConfirmMessage.textContent = message;
  deleteCallback = callback;
  deleteConfirmModal.classList.remove('hidden');
}

confirmDeleteBtn.addEventListener('click', () => {
  if (deleteCallback) deleteCallback();
  deleteConfirmModal.classList.add('hidden');
  saveToLocalStorage();
});

cancelDeleteBtn.addEventListener('click', () => {
  deleteConfirmModal.classList.add('hidden');
});

// Chat Management
function renderChats() {
  chatList.innerHTML = '';
  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = 'flex justify-between items-center p-3 bg-light-item dark:bg-dark-item rounded';
    const titleSpan = document.createElement('span');
    titleSpan.className = 'cursor-pointer flex-1 truncate';
    titleSpan.textContent = chat.title;
    titleSpan.addEventListener('click', () => selectChat(chat.id));
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'flex space-x-2';
    const renameButton = document.createElement('button');
    renameButton.innerHTML = '<i data-feather="edit" class="w-5 h-5"></i>';
    renameButton.addEventListener('click', () => openRenameChatModal(chat.id));
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i data-feather="trash-2" class="w-5 h-5"></i>';
    deleteButton.addEventListener('click', () => showDeleteConfirm(`Удалить чат "${chat.title}"?`, () => deleteChat(chat.id)));
    buttonDiv.appendChild(renameButton);
    buttonDiv.appendChild(deleteButton);
    chatItem.appendChild(titleSpan);
    chatItem.appendChild(buttonDiv);
    chatList.appendChild(chatItem);
  });
  feather.replace();
  saveToLocalStorage();
}

function selectChat(chatId) {
  currentChatId = chatId;
  renderMessages();
}

function deleteChat(chatId) {
  chats = chats.filter(chat => chat.id !== chatId);
  if (currentChatId === chatId) currentChatId = null;
  saveToLocalStorage();
  renderChats();
  renderMessages();
}

function openRenameChatModal(chatId) {
  renameChatId = chatId;
  const chat = chats.find(c => c.id === chatId);
  chatTitleInput.value = chat.title;
  renameChatModal.classList.remove('hidden');
}

saveChatTitleBtn.addEventListener('click', () => {
  const newTitle = chatTitleInput.value.trim();
  if (newTitle && renameChatId) {
    const chat = chats.find(c => c.id === renameChatId);
    if (chat) {
      chat.title = newTitle;
      saveToLocalStorage();
      renderChats();
    }
    renameChatModal.classList.add('hidden');
  }
});

cancelChatTitleBtn.addEventListener('click', () => {
  renameChatModal.classList.add('hidden');
});

newChatBtn.addEventListener('click', () => {
  const chat = { id: Date.now().toString(), title: `Чат ${chats.length + 1}`, messages: [] };
  chats.push(chat);
  saveToLocalStorage();
  renderChats();
  selectChat(chat.id);
});

// Section and Record Management
function renderRecords() {
  recordList.innerHTML = '';
  sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'mb-4';
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-center mb-2';
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold truncate';
    title.textContent = section.title;
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'flex space-x-2';
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = `<i data-feather="${section.collapsed ? 'chevron-down' : 'chevron-up'}" class="w-5 h-5"></i>`;
    toggleButton.addEventListener('click', () => toggleSection(section.id));
    const addRecordButton = document.createElement('button');
    addRecordButton.innerHTML = '<i data-feather="file-plus" class="w-5 h-5"></i>';
    addRecordButton.addEventListener('click', () => openNewRecordModal(section.id));
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i data-feather="trash-2" class="w-5 h-5"></i>';
    deleteButton.addEventListener('click', () => showDeleteConfirm(`Удалить раздел "${section.title}" и все его записи?`, () => deleteSection(section.id)));
    buttonDiv.appendChild(toggleButton);
    buttonDiv.appendChild(addRecordButton);
    buttonDiv.appendChild(deleteButton);
    headerDiv.appendChild(title);
    headerDiv.appendChild(buttonDiv);
    sectionDiv.appendChild(headerDiv);
    const recordsDiv = document.createElement('div');
    recordsDiv.id = `section-${section.id}`;
    recordsDiv.className = `section-content ml-4 space-y-2 ${section.collapsed ? '' : 'visible'}`;
    records.filter(record => record.sectionId === section.id).forEach(record => {
      const recordItem = document.createElement('div');
      recordItem.className = `p-3 rounded cursor-pointer flex justify-between items-center ${selectedRecord?.id === record.id ? 'bg-light-selected dark:bg-dark-selected' : 'bg-light-item dark:bg-dark-item'}`;
      const recordTitle = document.createElement('span');
      recordTitle.className = 'flex-1 truncate cursor-pointer';
      recordTitle.textContent = record.title;
      recordTitle.addEventListener('click', () => selectRecord(record.id));
      const buttonDiv = document.createElement('div');
      buttonDiv.className = 'flex space-x-2';
      const viewRecordButton = document.createElement('button');
      viewRecordButton.className = 'view-record-btn';
      viewRecordButton.innerHTML = '<i data-feather="eye" class="w-5 h-5"></i>';
      viewRecordButton.addEventListener('click', () => openViewRecordModal(record.id));
      const recordDeleteButton = document.createElement('button');
      recordDeleteButton.innerHTML = '<i data-feather="trash-2" class="w-5 h-5"></i>';
      recordDeleteButton.addEventListener('click', () => showDeleteConfirm(`Удалить запись "${record.title}"?`, () => deleteRecord(record.id)));
      buttonDiv.appendChild(viewRecordButton);
      buttonDiv.appendChild(recordDeleteButton);
      recordItem.appendChild(recordTitle);
      recordItem.appendChild(buttonDiv);
      recordsDiv.appendChild(recordItem);
    });
    sectionDiv.appendChild(recordsDiv);
    recordList.appendChild(sectionDiv);
  });
  feather.replace();
  saveToLocalStorage();
}

function toggleSection(sectionId) {
  const section = sections.find(s => s.id === sectionId);
  section.collapsed = !section.collapsed;
  saveToLocalStorage();
  renderRecords();
}

function selectRecord(recordId) {
  selectedRecord = records.find(record => record.id === recordId);
  saveToLocalStorage();
  renderRecords();
}

function deleteSection(sectionId) {
  sections = sections.filter(section => section.id !== sectionId);
  records = records.filter(record => record.sectionId !== sectionId);
  if (selectedRecord?.sectionId === sectionId) selectedRecord = null;
  saveToLocalStorage();
  renderRecords();
}

function deleteRecord(recordId) {
  records = records.filter(record => record.id !== recordId);
  if (selectedRecord?.id === recordId) selectedRecord = null;
  saveToLocalStorage();
  renderRecords();
}

newSectionBtn.addEventListener('click', () => {
  sectionTitleInput.value = '';
  newSectionModal.classList.remove('hidden');
});

saveSectionBtn.addEventListener('click', () => {
  const title = sectionTitleInput.value.trim();
  if (title) {
    sections.push({ id: Date.now().toString(), title, collapsed: false });
    saveToLocalStorage();
    renderRecords();
    newSectionModal.classList.add('hidden');
  }
});

cancelSectionBtn.addEventListener('click', () => {
  newSectionModal.classList.add('hidden');
});

function openNewRecordModal(sectionId) {
  recordSectionSelect.innerHTML = sections.map(s => `<option value="${s.id}" ${s.id === sectionId ? 'selected' : ''}>${s.title}</option>`).join('');
  recordTitleInput.value = '';
  recordBodyInput.value = '';
  newRecordModal.classList.remove('hidden');
}

saveRecordBtn.addEventListener('click', () => {
  const sectionId = recordSectionSelect.value;
  const title = recordTitleInput.value.trim();
  const body = recordBodyInput.value.trim();
  if (title && body) {
    records.push({ id: Date.now().toString(), sectionId, title, body });
    saveToLocalStorage();
    renderRecords();
    newRecordModal.classList.add('hidden');
  }
});

cancelRecordBtn.addEventListener('click', () => {
  newRecordModal.classList.add('hidden');
});

// View/Edit Record Modal
function openViewRecordModal(recordId) {
  viewRecordId = recordId;
  const record = records.find(r => r.id === recordId);
  if (record) {
    viewRecordContent.innerHTML = `
      <p class="mb-2"><strong>Раздел:</strong> ${sections.find(s => s.id === record.sectionId)?.title || 'Неизвестно'}</p>
      <p class="mb-2"><strong>Заголовок:</strong> ${record.title}</p>
      <p><strong>Тело:</strong> ${record.body}</p>
    `;
    editRecordForm.classList.add('hidden');
    viewRecordContent.classList.remove('hidden');
    viewRecordModal.classList.remove('hidden');
  }
}

editRecordBtn.addEventListener('click', () => {
  const record = records.find(r => r.id === viewRecordId);
  if (record) {
    editRecordSectionSelect.innerHTML = sections.map(s => `<option value="${s.id}" ${s.id === record.sectionId ? 'selected' : ''}>${s.title}</option>`).join('');
    editRecordTitleInput.value = record.title;
    editRecordBodyInput.value = record.body;
    viewRecordContent.classList.add('hidden');
    editRecordForm.classList.remove('hidden');
  }
});

saveEditRecordBtn.addEventListener('click', () => {
  const record = records.find(r => r.id === viewRecordId);
  if (record) {
    record.sectionId = editRecordSectionSelect.value;
    record.title = editRecordTitleInput.value.trim();
    record.body = editRecordBodyInput.value.trim();
    saveToLocalStorage();
    renderRecords();
    openViewRecordModal(viewRecordId);
  }
});

cancelEditRecordBtn.addEventListener('click', () => {
  viewRecordContent.classList.remove('hidden');
  editRecordForm.classList.add('hidden');
});

closeViewRecordBtn.addEventListener('click', () => {
  viewRecordModal.classList.add('hidden');
  viewRecordContent.classList.remove('hidden');
  editRecordForm.classList.add('hidden');
});

// Message Management
function renderMessages() {
  if (!currentChatId) {
    messageContainer.innerHTML = '<p class="text-center text-gray-500">Выберите чат или создайте новый</p>';
    return;
  }
  const chat = chats.find(chat => chat.id === currentChatId);
  if (!chat) return;

  messageContainer.innerHTML = '';
  chat.messages.forEach(message => {
    if (!message.text.trim()) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `p-4 mb-2 rounded-lg ${message.sender === 'user' ? 'bg-light-user-message dark:bg-dark-user-message ml-10' : 'bg-light-ai-message dark:bg-dark-ai-message mr-10'}`;
    const textP = document.createElement('p');
    textP.className = 'break-words';
    textP.textContent = message.text;
    messageDiv.appendChild(textP);
    if (message.sender === 'ai') {
      const buttonDiv = document.createElement('div');
      buttonDiv.className = 'flex space-x-3 mt-2';
      const copyButton = document.createElement('button');
      copyButton.innerHTML = '<i data-feather="copy" class="w-5 h-5"></i>';
      copyButton.addEventListener('click', () => copyMessage(message.text));
      const downloadButton = document.createElement('button');
      downloadButton.innerHTML = '<i data-feather="download" class="w-5 h-5"></i>';
      downloadButton.addEventListener('click', () => {
        if (chat.lastExcel) {
          downloadExcel(chat.lastExcel);
        } else {
          alert('Excel ещё не готов');
        }
      });
      buttonDiv.appendChild(copyButton);
      buttonDiv.appendChild(downloadButton);
      messageDiv.appendChild(buttonDiv);
    }
    messageContainer.appendChild(messageDiv);
  });
  messageContainer.scrollTop = messageContainer.scrollHeight;
  feather.replace();
}

function copyMessage(text) {
  navigator.clipboard.writeText(text);
  alert('Сообщение скопировано!');
}

function downloadExcel(base64) {
  const link = document.createElement('a');
  link.href = `/api/assistant/download-excel?base64=${encodeURIComponent(base64)}`;
  link.download = 'organizations.xlsx';
  link.click();
}

sendMessageBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text) return;

  if (warningsEnabled && !selectedRecord) {
    warningModal.classList.remove('hidden');
    return;
  }

  if (!currentChatId) {
    const chat = { id: Date.now().toString(), title: `Чат ${chats.length + 1}`, messages: [] };
    chats.push(chat);
    currentChatId = chat.id;
    saveToLocalStorage();
    renderChats();
  }

  const chat = chats.find(chat => chat.id === currentChatId);
  const fullMessage = selectedRecord ? `${selectedRecord.body}\n\n${text}` : text;

  chat.messages.push({ sender: 'user', text: fullMessage });
  messageInput.value = '';
  renderMessages();

  const typingDiv = document.createElement('div');
  typingDiv.className = 'p-4 mb-2 bg-light-ai-message dark:bg-dark-ai-message mr-10 typing';
  typingDiv.textContent = 'ИИ печатает...';
  messageContainer.appendChild(typingDiv);
  messageContainer.scrollTop = messageContainer.scrollHeight;

  try {
    const response = await fetch('/api/assistant/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        fragment: selectedRecord ? selectedRecord.body : "Без стандарта",
        organizations: text
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Backend response:', data);

    typingDiv.remove();

    if (!data.displayText) {
      throw new Error('No displayText in response');
    }

    chat.messages.push({ sender: 'ai', text: data.displayText });
    chat.lastExcel = data.excelBase64;

    saveToLocalStorage();
    renderMessages();
  } catch (error) {
    console.error('Error fetching response:', error);
    typingDiv.remove();
    chat.messages.push({ sender: 'ai', text: `Ошибка при запросе к серверу: ${error.message}` });
    saveToLocalStorage();
    renderMessages();
  }
});

// Initial Render
renderChats();
renderRecords();