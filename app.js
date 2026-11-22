// ── CampusConnect App JS ──

// ── NAVIGATION ──

function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + pageId);

  if (page) page.classList.add('active');

  document.querySelectorAll(`.nav-item[data-page="${pageId}"]`)
    .forEach(n => n.classList.add('active'));

  // Redraw charts whenever Academics is opened
  if (pageId === 'academics') {
    requestAnimationFrame(() => {
      drawAttendanceChart();
      drawCGPADonut();
    });
  }
}

document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.page));
  // Keyboard accessibility
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(item.dataset.page);
    }
  });
});

// ── TABS ──
document.querySelectorAll('.tabs').forEach(tabGroup => {
  tabGroup.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      tabGroup.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const target = tab.dataset.tab;
      const parent = tabGroup.closest('.tab-section') || document;
      parent.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
      const panel = parent.querySelector(`[data-panel="${target}"]`);
      if (panel) panel.style.display = '';
    });
  });
});

// ── LIKE POSTS ──
document.querySelectorAll('.post-action[data-action="like"]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.classList.toggle('liked');
    const countEl = btn.querySelector('.like-count');
    if (countEl) {
      let n = parseInt(countEl.textContent);
      countEl.textContent = btn.classList.contains('liked') ? n + 1 : n - 1;
    }
  });
});

// ── MODAL ──
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('open');
    // Focus first input/select/textarea (NOT the close button)
    const focusable = overlay.querySelector('input, select, textarea');
    if (focusable) setTimeout(() => focusable.focus(), 50);
  }
}
function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.classList.remove('open');
}

document.querySelectorAll('[data-open-modal]').forEach(btn => {
  btn.addEventListener('click', () => openModal(btn.dataset.openModal));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
});

// Close modal on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(overlay => {
      overlay.classList.remove('open');
    });
  }
});

// ── TOAST ──
function showToast(msg, icon = '✅') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span aria-hidden="true">${icon}</span> ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// ── NEW POST ──
const newPostForm = document.getElementById('new-post-form');
if (newPostForm) {
  newPostForm.addEventListener('submit', e => {
    e.preventDefault();
    const text = document.getElementById('new-post-text').value.trim();
    if (!text) return;
    const feed = document.getElementById('feed-posts');
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = `
      <div class="post-header">
        <div class="post-avatar post-avatar-you" aria-hidden="true">You</div>
        <div class="post-meta">
          <div class="post-author">You</div>
          <div class="post-time">Just now · <span class="tag tag-xs">All Students</span></div>
        </div>
      </div>
      <div class="post-body">${text}</div>
      <div class="post-actions">
        <button class="post-action" data-action="like" aria-label="Like post">❤️ <span class="like-count">0</span> Like</button>
        <button class="post-action" aria-label="Comment on post">💬 Comment</button>
        <button class="post-action" aria-label="Share post">🔗 Share</button>
      </div>`;
    // Re-attach like listener for new post
    post.querySelector('[data-action="like"]').addEventListener('click', function() {
      this.classList.toggle('liked');
      const countEl = this.querySelector('.like-count');
      if (countEl) {
        let n = parseInt(countEl.textContent);
        countEl.textContent = this.classList.contains('liked') ? n + 1 : n - 1;
      }
    });
    feed.prepend(post);
    document.getElementById('new-post-text').value = '';
    closeModal('modal-post');
    showToast('Post shared with your campus!');
  });
}

// ── CHAT ──
const CHAT_DATA = {
  'ai': {
    name: '🤖 Study Assistant', av: 'AI', avClass: '', status: 'AI-Powered',
    msgs: []
  },
  'rk': {
    name: 'Rahul Kumar', av: 'RK', avClass: 'chat-av-rk', status: 'Online',
    msgs: [
      { mine: false, text: "Hey! Did you finish the DSA assignment?", time: "10:24 AM" },
      { mine: true,  text: "Not yet 😅 The graph traversal part is tricky", time: "10:26 AM" },
      { mine: false, text: "Same here! I'm forming a study group tonight in the library. You in?", time: "10:27 AM" },
      { mine: true,  text: "Yes definitely! What time?", time: "10:28 AM" },
      { mine: false, text: "7 PM, Room G12. Can you send me the DS notes from Prof. Verma's class?", time: "10:29 AM" }
    ]
  },
  'ps': {
    name: 'Priya Sharma', av: 'PS', avClass: 'chat-av-ps', status: 'Online',
    msgs: [
      { mine: false, text: "Hey! Did you attend the Stats lecture today?", time: "9:00 AM" },
      { mine: true,  text: "Yes! Prof. Sharma covered probability distributions 📊", time: "9:02 AM" },
      { mine: false, text: "Can you share the notes? I missed the last 20 mins", time: "9:03 AM" },
      { mine: true,  text: "Sure, I'll send them tonight!", time: "9:05 AM" },
      { mine: false, text: "Thanks for the help!", time: "9:06 AM" }
    ]
  },
  'dsa': {
    name: 'DSA Doubt Busters 👥', av: 'DSA', avClass: 'chat-av-dsa', status: '12 members',
    msgs: [
      { mine: false, text: "Hey everyone! Anyone stuck on the graph DFS problem?", time: "8:00 AM" },
      { mine: false, text: "Yes! I keep getting a stack overflow on recursive DFS 😅", time: "8:05 AM" },
      { mine: true,  text: "Try iterative DFS with an explicit stack — saves you from recursion depth issues", time: "8:10 AM" },
      { mine: false, text: "That worked! Thanks 🙏", time: "8:12 AM" },
      { mine: false, text: "Meet at library tonight 7 PM for group session?", time: "8:15 AM" }
    ]
  },
  'am': {
    name: 'Aditya Mehta', av: 'AM', avClass: 'chat-av-am', status: 'Last seen 1h ago',
    msgs: [
      { mine: false, text: "Hey! Are the Sedgewick Algorithms books still available?", time: "Yesterday" },
      { mine: true,  text: "Yes they are! ₹350 for both.", time: "Yesterday" },
      { mine: false, text: "Perfect. Can we meet tomorrow near the library?", time: "Yesterday" },
      { mine: true,  text: "Sure! 11 AM works for me", time: "Yesterday" }
    ]
  },
  'kc': {
    name: 'Kavya Chandra', av: 'KC', avClass: 'chat-av-kc', status: 'Last seen 2d ago',
    msgs: [
      { mine: false, text: "Are you joining the IEEE workshop next week?", time: "2d ago" },
      { mine: true,  text: "Yes! Should be a great session on embedded systems", time: "2d ago" },
      { mine: false, text: "Okay see you tomorrow! 😊", time: "2d ago" }
    ]
  }
};

function loadChatContact(contactId) {
  const data = CHAT_DATA[contactId];
  if (!data) return;

  // Update header
  const nameEl = document.querySelector('.chat-contact-name');
  const avEl = document.querySelector('.chat-header .chat-av');
  const statusEl = document.querySelector('.chat-online-status');
  if (nameEl) nameEl.textContent = data.name;
  if (avEl) { avEl.textContent = data.av; avEl.className = 'chat-av ' + data.avClass; avEl.style.width='36px'; avEl.style.height='36px'; }
  if (statusEl) statusEl.innerHTML = `<span class="online" aria-hidden="true"></span> ${data.status}`;

  // Render messages
  const msgs = document.getElementById('chat-messages');
  if (!msgs) return;
  msgs.innerHTML = '';
  data.msgs.forEach(m => {
    const div = document.createElement('div');
    div.className = 'msg ' + (m.mine ? 'mine' : 'theirs');
    if (m.mine) {
      div.innerHTML = `<span class="msg-time">${m.time}</span><div class="msg-bubble">${m.text}</div><div class="msg-av msg-av-you" aria-hidden="true">AK</div>`;
    } else {
      div.innerHTML = `<div class="msg-av ${data.avClass}" aria-hidden="true">${data.av.slice(0,2)}</div><div class="msg-bubble">${m.text}</div><span class="msg-time">${m.time}</span>`;
    }
    msgs.appendChild(div);
  });
  msgs.scrollTop = msgs.scrollHeight;
}

const chatItems = document.querySelectorAll('.chat-item');
chatItems.forEach(item => {
  item.addEventListener('click', () => {
    chatItems.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
    item.classList.add('active');
    item.setAttribute('aria-selected','true');
    const contactId = item.dataset.contact || item.id?.replace('-chat-item','') || 'rk';
    loadChatContact(contactId);
  });
});
// Load default
loadChatContact('rk');

// ── GROUP OPEN BUTTON ──
document.addEventListener('click', e => {
  const openBtn = e.target.closest('[aria-label*="Open"][aria-label*="group"]');
  if (!openBtn) return;
  const groupCard = openBtn.closest('.group-card');
  const groupNameEl = groupCard ? groupCard.querySelector('.group-name') : null;
  const groupName = groupNameEl ? groupNameEl.textContent.trim() : 'Study Group';
  const initials = groupName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();

  // Add group to CHAT_DATA if not already there
  const key = 'grp_' + groupName.replace(/\s+/g, '_').toLowerCase();
  if (!CHAT_DATA[key]) {
    CHAT_DATA[key] = {
      name: groupName + ' 👥', av: initials, avClass: '', status: 'Group',
      msgs: [
        { mine: false, text: `Welcome to ${groupName}! 👋`, time: '9:00 AM' },
        { mine: false, text: 'Feel free to share doubts, resources and study schedules here.', time: '9:01 AM' },
        { mine: true,  text: 'Hi everyone! Happy to be here 😊', time: '9:05 AM' },
        { mine: false, text: 'Great! We usually meet twice a week. Check the pinned message for schedule.', time: '9:10 AM' }
      ]
    };
  }

  // Add or update chat list item for this group
  let existingItem = document.querySelector(`[data-contact="${key}"]`);
  if (!existingItem) {
    const chatList = document.querySelector('.chat-list');
    const newItem = document.createElement('div');
    newItem.className = 'chat-item';
    newItem.setAttribute('role', 'option');
    newItem.setAttribute('aria-selected', 'false');
    newItem.setAttribute('data-contact', key);
    newItem.innerHTML = `
      <div class="chat-av" style="background:linear-gradient(135deg,#9f7aea,#63b3ed)">${initials}</div>
      <div class="chat-info">
        <div class="chat-item-row"><div class="chat-name">${groupName} 👥</div><div class="chat-time">now</div></div>
        <div class="chat-preview">Welcome to ${groupName}!</div>
      </div>`;
    newItem.addEventListener('click', () => {
      document.querySelectorAll('.chat-item').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
      newItem.classList.add('active'); newItem.setAttribute('aria-selected','true');
      loadChatContact(key);
    });
    chatList.insertBefore(newItem, chatList.children[1]); // after AI bot
    existingItem = newItem;
  }

  navigate('messages');
  setTimeout(() => {
    document.querySelectorAll('.chat-item').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
    existingItem.classList.add('active'); existingItem.setAttribute('aria-selected','true');
    loadChatContact(key);
  }, 150);
});




const chatSendBtn = document.getElementById('chat-send');
const chatInputEl = document.getElementById('chat-input');
if (chatSendBtn && chatInputEl) {
  function sendChatMsg() {
    const val = chatInputEl.value.trim();
    if (!val) return;
    const msgs = document.getElementById('chat-messages');
    const el = document.createElement('div');
    el.className = 'msg mine';
    el.innerHTML = `<span class="msg-time">now</span><div class="msg-bubble">${val}</div><div class="msg-av msg-av-you" aria-hidden="true">You</div>`;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    chatInputEl.value = '';
    // Fake reply
    setTimeout(() => {
      const replies = ['Got it! 👍', 'Sure, sounds good!', 'Let me check and get back to you.', 'Okay, thanks!', 'Noted 📝'];
      const reply = document.createElement('div');
      reply.className = 'msg theirs';
      reply.innerHTML = `<div class="msg-av msg-av-rk" aria-hidden="true">RK</div><div class="msg-bubble">${replies[Math.floor(Math.random() * replies.length)]}</div><span class="msg-time">now</span>`;
      msgs.appendChild(reply);
      msgs.scrollTop = msgs.scrollHeight;
    }, 900 + Math.random() * 800);
  }
  chatSendBtn.addEventListener('click', sendChatMsg);
  chatInputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMsg(); });
}

// ── EVENT RSVP ──
document.querySelectorAll('[data-rsvp]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.classList.contains('rsvp-done')) {
      btn.classList.remove('rsvp-done');
      btn.textContent = 'RSVP';
      btn.setAttribute('aria-pressed', 'false');
    } else {
      btn.classList.add('rsvp-done');
      btn.textContent = '✓ Going';
      btn.setAttribute('aria-pressed', 'true');
      showToast("You're going! Added to your calendar 📅");
    }
  });
});

// ── GROUP JOIN ──
document.querySelectorAll('[data-join]').forEach(btn => {
  btn.addEventListener('click', () => {
    const isClub = !!btn.closest('#page-clubs');
    if (btn.textContent.trim() === 'Joined' || btn.textContent.trim() === 'Joined Club') {
      btn.textContent = btn.dataset.joinLabel || 'Join';
      btn.className = btn.className.replace('btn-primary', 'btn-secondary');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      btn.dataset.joinLabel = btn.textContent.trim();
      btn.textContent = isClub ? 'Joined Club' : 'Joined';
      btn.className = btn.className.replace('btn-secondary', 'btn-primary');
      btn.setAttribute('aria-pressed', 'true');
      showToast(isClub ? `Joined club! 🎉` : 'Joined! 🎓');

      if (isClub) {
        const card = btn.closest('.card');
        const clubNameEl = card ? card.querySelector('.club-name') : null;
        const clubName = clubNameEl ? clubNameEl.textContent.trim() : 'Club';
        const initials = clubName.split(' ').map(w => w[0]).join('').slice(0,3).toUpperCase();
        const key = 'club_' + clubName.replace(/\s+/g,'_').toLowerCase();
        if (!CHAT_DATA[key]) {
          CHAT_DATA[key] = {
            name: clubName + ' 🌟', av: initials, avClass: '', status: 'Club Group',
            msgs: [
              { mine: false, text: `Welcome to the ${clubName} group! 🎉`, time: 'now' },
              { mine: false, text: 'Introduce yourself to the team!', time: 'now' },
              { mine: true,  text: `Hi everyone! Just joined ${clubName}. Excited! 🙌`, time: 'now' },
              { mine: false, text: 'Great to have you! Check pinned message for our next event.', time: 'now' }
            ]
          };
        }
        let existingItem = document.querySelector(`[data-contact="${key}"]`);
        if (!existingItem) {
          const chatList = document.querySelector('.chat-list');
          const newItem = document.createElement('div');
          newItem.className = 'chat-item';
          newItem.setAttribute('role','option'); newItem.setAttribute('aria-selected','false');
          newItem.setAttribute('data-contact', key);
          newItem.innerHTML = `
            <div class="chat-av" style="background:linear-gradient(135deg,#f6ad55,#fc8181)">${initials}</div>
            <div class="chat-info">
              <div class="chat-item-row"><div class="chat-name">${clubName} 🌟</div><div class="chat-time">now</div></div>
              <div class="chat-preview">Welcome to ${clubName}!</div>
            </div>`;
          newItem.addEventListener('click', () => {
            document.querySelectorAll('.chat-item').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
            newItem.classList.add('active'); newItem.setAttribute('aria-selected','true');
            loadChatContact(key);
          });
          if (chatList) chatList.insertBefore(newItem, chatList.children[1]);
        }
        showToast(`${clubName} group added to Messages! 💬`);
      }
    }
  });
});

// ── MARKETPLACE CONTACT ──
document.querySelectorAll('[data-contact]').forEach(btn => {
  btn.addEventListener('click', () => {
    // Get seller name from closest item-card
    const card = btn.closest('.item-card');
    const sellerEl = card ? card.querySelector('.item-seller') : null;
    const itemNameEl = card ? card.querySelector('.item-name') : null;
    const sellerName = sellerEl ? sellerEl.textContent.replace('Sold by ', '').split('·')[0].trim() : 'Aditya Mehta';
    const itemName = itemNameEl ? itemNameEl.textContent.trim() : 'item';

    // Navigate to messages page
    navigate('messages');

    // Highlight/select first chat item as seller contact
    setTimeout(() => {
      const chatItems = document.querySelectorAll('.chat-item');
      chatItems.forEach(c => { c.classList.remove('active'); c.setAttribute('aria-selected','false'); });
      // Select the first real person chat (not AI)
      const firstPerson = document.querySelector('.chat-item[data-contact="rk"], .chat-item#rk-chat-item, .chat-item:not(#ai-chat-item)');
      if (firstPerson) { firstPerson.classList.add('active'); firstPerson.setAttribute('aria-selected','true'); }

      // Update chat header with seller info
      const nameEl = document.querySelector('.chat-contact-name');
      if (nameEl) nameEl.textContent = sellerName;

      // Add opening message in chat
      const msgs = document.getElementById('chat-messages');
      if (msgs) {
        const el = document.createElement('div');
        el.className = 'msg mine';
        el.innerHTML = `<span class="msg-time">now</span><div class="msg-bubble">Hi! I'm interested in your <strong>${itemName}</strong>. Is it still available?</div><div class="msg-av msg-av-you" aria-hidden="true">AK</div>`;
        msgs.appendChild(el);
        msgs.scrollTop = msgs.scrollHeight;
        // Fake seller reply
        setTimeout(() => {
          const reply = document.createElement('div');
          reply.className = 'msg theirs';
          reply.innerHTML = `<div class="msg-av msg-av-rk" aria-hidden="true">${sellerName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div><div class="msg-bubble">Yes, it's available! When would you like to meet? 😊</div><span class="msg-time">now</span>`;
          msgs.appendChild(reply);
          msgs.scrollTop = msgs.scrollHeight;
        }, 1000);
      }
    }, 200);
  });
});

// ── LOST & FOUND MARK ──
document.querySelectorAll('[data-found]').forEach(btn => {
  btn.addEventListener('click', () => {
    showToast('Marked as found! Great job 🎉', '🎉');
    btn.textContent = '✓ Found';
    btn.disabled = true;
    btn.style.opacity = '0.5';
  });
});

// ── SEARCH ──
const searchInput = document.getElementById('global-search');
if (searchInput) {
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      showToast(`Searching for "${searchInput.value.trim()}"...`, '🔍');
    }
  });
}

// ── PROGRESS BARS ANIMATE ON LOAD ──
setTimeout(() => {
  document.querySelectorAll('.progress-fill').forEach(bar => {
    bar.style.width = bar.dataset.width || bar.style.width;
  });
}, 300);

// ── ATTENDANCE CHART (canvas) ──
function drawAttendanceChart() {
  const canvas = document.getElementById('attendance-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = [88, 75, 92, 60, 85, 95, 70];
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue'];
  const W = canvas.width, H = canvas.height;
  const pad = { top: 20, bottom: 30, left: 30, right: 16 };
  const chartW = W - pad.left - pad.right;
  const chartH = H - pad.top - pad.bottom;
  const barW = (chartW / data.length) * 0.6;
  const gap = chartW / data.length;

  ctx.clearRect(0, 0, W, H);

  // Grid lines
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
  }

  data.forEach((val, i) => {
    const x = pad.left + i * gap + (gap - barW) / 2;
    const barH = (val / 100) * chartH;
    const y = pad.top + chartH - barH;

    const grd = ctx.createLinearGradient(0, y, 0, y + barH);
    grd.addColorStop(0, '#63b3ed');
    grd.addColorStop(1, 'rgba(99,179,237,0.2)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();

    ctx.fillStyle = 'rgba(122,127,153,0.8)';
    ctx.font = '10px DM Sans';
    ctx.textAlign = 'center';
    ctx.fillText(labels[i], x + barW / 2, H - 8);

    ctx.fillStyle = '#e8eaf0';
    ctx.font = 'bold 9px DM Sans';
    ctx.fillText(val + '%', x + barW / 2, y - 4);
  });
}

// ── CGPA DONUT ──
function drawCGPADonut() {
  const canvas = document.getElementById('cgpa-donut');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const r = 60, lineW = 14;
  const cgpa = 8.4, maxCGPA = 10;
  const pct = cgpa / maxCGPA;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = lineW;
  ctx.lineCap = 'round';

  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grd.addColorStop(0, '#63b3ed');
  grd.addColorStop(1, '#9f7aea');
  ctx.strokeStyle = grd;
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.stroke();

  ctx.fillStyle = '#e8eaf0';
  ctx.font = 'bold 22px Syne, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cgpa.toFixed(1), cx, cy - 6);
  ctx.fillStyle = '#7a7f99';
  ctx.font = '11px DM Sans, sans-serif';
  ctx.fillText('CGPA', cx, cy + 16);
}

// ── EDIT PROFILE ──
const editProfileForm = document.getElementById('edit-profile-form');

// Apply profile information to the webpage
function applyProfile(profile) {
  document.getElementById('profile-name-display').textContent =
    profile.name;

  document.getElementById('roll-display').textContent =
    'Roll No: ' + profile.roll;

  // Generate avatar initials
  const nameParts = profile.name.trim().split(/\s+/);
  const initials = (
    nameParts[0].charAt(0) +
    (nameParts[1]?.charAt(0) || '')
  ).toUpperCase();

  document.querySelectorAll('.avatar, .profile-avatar-lg')
    .forEach(avatar => {
      avatar.textContent = initials;
    });


  // Update Home Feed greeting
  const greeting = document.querySelector('.page-title');

  if (greeting && greeting.textContent.includes('Good morning')) {
    const firstName = profile.name.trim().split(/\s+/)[0];
    greeting.textContent = `Good morning, ${firstName}! 👋`;
  }

  // Update profile bio if available
  const aboutSection = document.querySelector('.profile-about');

  if (aboutSection && profile.bio) {
    aboutSection.textContent = profile.bio;
  }
}

// Load saved profile when website opens
let savedProfile = JSON.parse(
  localStorage.getItem('campusconnect_profile') || 'null'
);

// If saved information exists, display it
if (savedProfile) {
  applyProfile(savedProfile);
}

if (editProfileForm) {

  // Fill form with current profile information
  document.getElementById('edit-name').value =
    document.getElementById('profile-name-display').textContent;

  document.getElementById('edit-rollno').value =
    document.getElementById('roll-display').textContent
      .replace('Roll No: ', '');

  document.getElementById('edit-bio').value =
    savedProfile?.bio || '';

  editProfileForm.addEventListener('submit', e => {
    e.preventDefault();

    const newName =
      document.getElementById('edit-name').value.trim();

    const newRoll =
      document.getElementById('edit-rollno').value.trim();

    const newBio =
      document.getElementById('edit-bio').value.trim();

    if (!newName || !newRoll) {
      showToast('Please fill in all required fields', '⚠️');
      return;
    }

    // Create profile object
    const profile = {
      name: newName,
      roll: newRoll,
      bio: newBio
    };

    // Save profile permanently in browser storage
    localStorage.setItem(
      'campusconnect_profile',
      JSON.stringify(profile)
    );

    // Update webpage immediately
    applyProfile(profile);

    // Update dashboard greeting
    const greeting = document.querySelector('.page-title');

    if (greeting && greeting.textContent.includes('Good morning')) {
      greeting.textContent =
        `Good morning, ${newName.split(' ')[0]}! 👋`;
    }

    closeModal('modal-edit-profile');
    showToast('Profile saved successfully! ✨');
  });
}


// ══════════════════════════════════════════
// ── TIMETABLE EDIT MODE ──
// ══════════════════════════════════════════
let timetableEditMode = false;
let currentEditCell = null;

function toggleTimetableEdit() {
  timetableEditMode = !timetableEditMode;
  const table = document.querySelector('.timetable');
  const banner = document.getElementById('timetable-edit-banner');
  const btn = document.getElementById('timetable-edit-btn');
  if (timetableEditMode) {
    table.classList.add('timetable-edit-mode');
    banner.classList.add('visible');
    btn.textContent = '✓ Done Editing';
    btn.className = 'btn btn-primary btn-sm';
    // Attach click listeners to all class cells
    document.querySelectorAll('.class-cell').forEach(cell => {
      cell.addEventListener('click', openCellEdit);
    });
    showToast('Click any class cell to edit it ✏️', '✏️');
  } else {
    table.classList.remove('timetable-edit-mode');
    banner.classList.remove('visible');
    btn.textContent = '✏️ Edit Timetable';
    btn.className = 'btn btn-secondary btn-sm';
    document.querySelectorAll('.class-cell').forEach(cell => {
      cell.removeEventListener('click', openCellEdit);
    });
    showToast('Timetable saved! 🗓️');
  }
}

function openCellEdit(e) {
  currentEditCell = e.currentTarget;
  const subject = currentEditCell.childNodes[0].textContent.trim();
  const small = currentEditCell.querySelector('small');
  const room = small ? small.textContent.trim() : '';
  const colorClass = ['class-blue','class-green','class-orange','class-purple','class-pink']
    .find(c => currentEditCell.classList.contains(c)) || 'class-blue';
  document.getElementById('cell-subject').value = subject;
  document.getElementById('cell-room').value = room;
  document.getElementById('cell-color').value = colorClass;
  openModal('modal-edit-cell');
}

function saveCellEdit() {
  if (!currentEditCell) return;
  const subject = document.getElementById('cell-subject').value.trim();
  const room = document.getElementById('cell-room').value.trim();
  const color = document.getElementById('cell-color').value;
  if (!subject) { showToast('Subject name required', '⚠️'); return; }
  // Update classes
  currentEditCell.className = 'class-cell ' + color;
  currentEditCell.innerHTML = `${subject}<br><small>${room}</small>`;
  closeModal('modal-edit-cell');
  showToast('Class updated! 🗓️');
  // Re-attach listener since innerHTML replaced content
  currentEditCell.addEventListener('click', openCellEdit);
}

// ══════════════════════════════════════════
// ── ASSIGNMENT EDIT ──
// ══════════════════════════════════════════
let currentEditAssignment = null;

function editAssignment(btn) {
  currentEditAssignment = btn.closest('.assignment-item');
  const name = currentEditAssignment.querySelector('.assignment-name').textContent;
  const due = currentEditAssignment.querySelector('.assignment-due').textContent;
  const statusTag = currentEditAssignment.querySelector('.tag');
  const statusText = statusTag ? statusTag.textContent.trim() : 'Pending';
  document.getElementById('ea-name').value = name;
  document.getElementById('ea-due').value = due;
  const statusSel = document.getElementById('ea-status');
  for (let opt of statusSel.options) {
    if (opt.value === statusText) { opt.selected = true; break; }
  }
  openModal('modal-edit-assignment');
}

function saveAssignmentEdit() {
  if (!currentEditAssignment) return;
  const name = document.getElementById('ea-name').value.trim();
  const due = document.getElementById('ea-due').value.trim();
  const status = document.getElementById('ea-status').value;
  if (!name) { showToast('Assignment name required', '⚠️'); return; }
  currentEditAssignment.querySelector('.assignment-name').textContent = name;
  currentEditAssignment.querySelector('.assignment-due').textContent = due;
  const tag = currentEditAssignment.querySelector('.tag');
  if (tag) {
    tag.textContent = status;
    tag.className = 'tag';
    if (status === 'Pending') tag.classList.add('red');
    else if (status === 'In Progress') tag.classList.add('orange');
    else if (status === 'Submitted' || status === 'Graded') tag.classList.add('green');
  }
  closeModal('modal-edit-assignment');
  showToast('Assignment updated! ✅');
}

function addAssignment() {
  const icon = document.getElementById('aa-icon').value;
  const name = document.getElementById('aa-name').value.trim();
  const due = document.getElementById('aa-due').value.trim();
  const status = document.getElementById('aa-status').value;
  if (!name) { showToast('Assignment name required', '⚠️'); return; }
  const list = document.getElementById('assignment-list');
  const colorMap = {'Pending':'var(--accent4)','In Progress':'var(--accent2)','Submitted':'var(--accent3)','Graded':'var(--accent3)'};
  const tagClass = {'Pending':'red','In Progress':'orange','Submitted':'green','Graded':'green'};
  const item = document.createElement('div');
  item.className = 'assignment-item';
  item.style.borderLeft = `3px solid ${colorMap[status] || 'var(--accent)'}`;
  item.innerHTML = `
    <span class="assignment-icon" aria-hidden="true">${icon}</span>
    <div class="assignment-body">
      <div class="assignment-name">${name}</div>
      <div class="assignment-due">${due}</div>
    </div>
    <span class="tag ${tagClass[status] || ''}">${status}</span>
    <button class="btn btn-ghost btn-sm" onclick="editAssignment(this)" aria-label="Edit assignment" style="margin-left:4px;padding:4px 8px;font-size:12px;">✏️</button>`;
  list.appendChild(item);
  // Clear form
  document.getElementById('aa-name').value = '';
  document.getElementById('aa-due').value = '';
  closeModal('modal-add-assignment');
  showToast('Assignment added! 📝');
}

// ══════════════════════════════════════════
// ── PROFILE: ABOUT, SKILLS, ACHIEVEMENTS ──
// ══════════════════════════════════════════
function editAbout() {
  const current = document.getElementById('profile-about-text').textContent.trim();
  document.getElementById('edit-about-text').value = current;
  openModal('modal-edit-about');
}
function saveAbout() {
  const text = document.getElementById('edit-about-text').value.trim();
  if (!text) { showToast('Bio cannot be empty', '⚠️'); return; }
  document.getElementById('profile-about-text').textContent = text;
  // Also update the bio field in edit-profile modal
  const bioProp = document.getElementById('edit-bio');
  if (bioProp) bioProp.value = text;
  closeModal('modal-edit-about');
  showToast('Bio updated! ✨');
}

function saveSkills() {
  const raw = document.getElementById('skills-input').value;
  const skills = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (!skills.length) { showToast('Add at least one skill', '⚠️'); return; }
  const colors = ['', 'purple', 'green', 'orange', 'pink', '', 'purple', 'green', 'orange'];
  const container = document.getElementById('skills-tags');
  container.innerHTML = skills.map((s, i) => `<span class="tag ${colors[i%colors.length]}">${s}</span>`).join('');
  closeModal('modal-edit-skills');
  showToast('Skills updated! 🚀');
}
// Pre-fill skills modal when opening
document.addEventListener('click', e => {
  if (e.target.closest('[data-open-modal="modal-edit-skills"]') || (e.target.onclick && e.target.getAttribute('onclick') === "openModal('modal-edit-skills')")) {
    const tags = document.getElementById('skills-tags');
    if (tags) {
      const skills = Array.from(tags.querySelectorAll('.tag')).map(t => t.textContent).join(', ');
      document.getElementById('skills-input').value = skills;
    }
  }
});

function deleteAchievement(btn) {
  const item = btn.closest('.achievement-item');
  item.style.opacity = '0';
  item.style.transition = 'opacity 0.3s';
  setTimeout(() => item.remove(), 300);
  showToast('Achievement removed');
}

function addAchievement() {
  const icon = document.getElementById('ach-icon').value;
  const name = document.getElementById('ach-name').value.trim();
  const date = document.getElementById('ach-date').value.trim();
  if (!name) { showToast('Achievement name required', '⚠️'); return; }
  const list = document.getElementById('achievement-list');
  const item = document.createElement('div');
  item.className = 'achievement-item';
  item.innerHTML = `
    <div class="achievement-icon" aria-hidden="true">${icon}</div>
    <div style="flex:1">
      <div class="achievement-name">${name}</div>
      <div class="achievement-date">${date}</div>
    </div>
    <button class="btn btn-ghost btn-sm" onclick="deleteAchievement(this)" aria-label="Remove achievement" style="font-size:11px;padding:3px 7px;opacity:0.5;">✕</button>`;
  list.appendChild(item);
  document.getElementById('ach-name').value = '';
  document.getElementById('ach-date').value = '';
  closeModal('modal-add-achievement');
  showToast('Achievement added! 🏆');
}

// ══════════════════════════════════════════
// ── STUDY TIMER (POMODORO) ──
// ══════════════════════════════════════════
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 96; // ~603
let timerMinutes = 25;
let timerSeconds = 0;
let timerTotal = 25 * 60;
let timerRemaining = timerTotal;
let timerRunning = false;
let timerInterval = null;
let timerMode = 'Pomodoro';
let sessionsDone = 0;
let breaksDone = 0;
let totalFocusSeconds = 0;
let sessionInCycle = 1;

const TIPS = [
  "During a Pomodoro, put your phone face-down and close unneeded tabs. Full focus for 25 minutes beats 2 hours of distracted studying.",
  "After 4 Pomodoros, take a longer 15–20 minute break. Your brain consolidates memory during rest.",
  "Start with your hardest task when your energy is highest. Use the first Pomodoro of the day for deep work.",
  "If a distraction pops up, write it down and come back later. Don't break the session.",
  "Studying in a consistent place trains your brain to enter focus mode faster. Designate a study spot.",
  "The Pomodoro technique was invented by Francesco Cirillo using a tomato-shaped kitchen timer 🍅",
];

function setTimerMode(btn, minutes, label) {
  document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  timerMode = label;
  timerMinutes = minutes;
  resetTimer();
}

function updateTimerDisplay() {
  const m = Math.floor(timerRemaining / 60);
  const s = timerRemaining % 60;
  document.getElementById('timer-display').textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  document.getElementById('timer-label').textContent = timerMode;
  // Update ring
  const progress = document.getElementById('timer-ring-progress');
  const pct = timerRemaining / timerTotal;
  progress.style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - pct);
}

function toggleTimer() {
  if (timerRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  timerRunning = true;
  document.getElementById('timer-start-btn').textContent = '⏸ Pause';
  // Show a random tip
  const tip = document.getElementById('focus-tip');
  if (tip) tip.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      onTimerComplete();
      return;
    }
    timerRemaining--;
    if (timerMode === 'Pomodoro') totalFocusSeconds++;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() {
  timerRunning = false;
  clearInterval(timerInterval);
  document.getElementById('timer-start-btn').textContent = '▶ Resume';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerTotal = timerMinutes * 60;
  timerRemaining = timerTotal;
  updateTimerDisplay();
  document.getElementById('timer-start-btn').textContent = '▶ Start';
  const progress = document.getElementById('timer-ring-progress');
  progress.style.strokeDashoffset = 0;
}

function skipTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRemaining = 0;
  onTimerComplete();
}

function onTimerComplete() {
  document.getElementById('timer-start-btn').textContent = '▶ Start';
  const progress = document.getElementById('timer-ring-progress');
  progress.style.strokeDashoffset = TIMER_CIRCUMFERENCE;

  if (timerMode === 'Pomodoro') {
    sessionsDone++;
    document.getElementById('stat-sessions').textContent = sessionsDone;
    document.getElementById('stat-focus').textContent = Math.floor(totalFocusSeconds / 60) + ' min';
    addSessionLogEntry();
    showToast('🎉 Pomodoro complete! Time for a break!', '🎉');
    // Advance cycle dot
    updateCycleDots();
    // Determine next: after 4 sessions suggest long break
    if (sessionsDone % 4 === 0) {
      showToast('4 sessions done! Take a long break 🛌', '🛌');
    }
  } else {
    breaksDone++;
    document.getElementById('stat-breaks').textContent = breaksDone;
    showToast('Break over — back to focus! 💪', '💪');
  }
  // Update streak display
  document.getElementById('stat-streak').textContent = Math.ceil(sessionsDone / 4) + (sessionsDone >= 4 ? '+ days 🔥' : ' sessions');
  resetTimer();
}

function updateCycleDots() {
  const dots = document.querySelectorAll('.timer-dot');
  const idx = (sessionsDone - 1) % 4;
  dots[idx].classList.remove('active');
  dots[idx].classList.add('done');
  const nextIdx = sessionsDone % 4;
  if (nextIdx < dots.length) {
    dots[nextIdx].classList.add('active');
    dots[nextIdx].classList.remove('done');
  }
  const total = sessionsDone % 4 === 0 ? 4 : sessionsDone % 4;
  const next = (sessionsDone % 4) + 1;
  document.getElementById('session-count').textContent = (sessionsDone % 4 === 0 ? 4 : sessionsDone % 4) + ' / 4';
  if (sessionsDone % 4 === 0) {
    // Reset dots for new cycle
    dots.forEach((d, i) => {
      d.classList.remove('active','done');
      if (i === 0) d.classList.add('active');
    });
    document.getElementById('session-count').textContent = '1 / 4';
  }
}

function addSessionLogEntry() {
  const logEl = document.getElementById('session-log');
  const empty = document.getElementById('log-empty');
  if (empty) empty.remove();
  const subject = document.getElementById('timer-subject').value;
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  const entry = document.createElement('div');
  entry.className = 'timer-log-entry';
  entry.innerHTML = `
    <div class="timer-log-icon">🍅</div>
    <div class="timer-log-info">
      <div class="timer-log-subject">${subject}</div>
      <div class="timer-log-meta">Session ${sessionsDone} · ${timeStr}</div>
    </div>
    <div class="timer-log-time">25 min</div>`;
  logEl.prepend(entry);
}

function clearSessionLog() {
  const log = document.getElementById('session-log');
  log.innerHTML = '<div class="timer-log-empty" id="log-empty">No sessions yet. Start your first Pomodoro! 🍅</div>';
}

// Init timer ring dash
document.addEventListener('DOMContentLoaded', () => {
  const progress = document.getElementById('timer-ring-progress');
  if (progress) {
    progress.style.strokeDasharray = TIMER_CIRCUMFERENCE;
    progress.style.strokeDashoffset = 0;
  }
});

// ══════════════════════════════════════════
// ── CREATE EVENT ──
// ══════════════════════════════════════════
function createEvent() {
  const name = document.getElementById('event-name').value.trim();
  const datetime = document.getElementById('event-datetime').value;
  const venue = document.getElementById('event-venue').value.trim();
  const category = document.getElementById('event-category').value;
  const desc = document.getElementById('event-desc').value.trim();
  
  if (!name || !venue) {
    showToast('Please fill in Event Name and Venue', '⚠️');
    return;
  }

  // Format date/time - time is optional
  let dateStr = 'TBD', timeStr = '';
  if (datetime) {
    const dt = new Date(datetime);
    dateStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    timeStr = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Create event card
  const bannerEmojis = { 'Tech': '🚀', 'Cultural': '🎭', 'Sports': '⚽', 'Career': '💼', 'Other': '🎪' };
  const bannerColors = { 'Tech': 'banner-blue', 'Cultural': 'banner-orange', 'Sports': 'banner-green', 'Career': 'banner-purple', 'Other': 'banner-pink' };
  const tagClass = category.toLowerCase();
  
  const card = document.createElement('div');
  card.className = 'event-card';
  card.innerHTML = `
    <div class="event-banner ${bannerColors[category] || 'banner-blue'}" aria-hidden="true">${bannerEmojis[category] || '🎉'}</div>
    <div class="event-body">
      <div class="flex-gap-10 mb-16"><span class="tag ${tagClass === 'tech' ? '' : tagClass === 'cultural' ? 'orange' : tagClass === 'sports' ? 'green' : tagClass === 'career' ? 'purple' : 'pink'}">${category}</span></div>
      <div class="event-title">${name}</div>
      <div class="event-meta">
        <span>📅 ${dateStr} ${timeStr}</span>
        <span>📍 ${venue}</span>
        ${desc ? `<span>ℹ️ ${desc.substring(0, 30)}${desc.length > 30 ? '...' : ''}</span>` : ''}
      </div>
    </div>
    <div class="event-footer">
      <div class="avatar-stack" aria-label="You are attending">
        <div class="av" style="background:linear-gradient(135deg,#68d391,#63b3ed)" aria-hidden="true">You</div>
      </div>
      <button class="btn btn-primary btn-sm" data-rsvp aria-label="RSVP for ${name}">✓ Going</button>
    </div>
  `;
  
  // Add to events grid
  const grid = document.getElementById('events-grid');
  if (grid) {
    grid.prepend(card);
    // Re-attach RSVP listeners
    card.querySelector('[data-rsvp]').addEventListener('click', function() {
      if (this.classList.contains('rsvp-done')) {
        this.classList.remove('rsvp-done');
        this.textContent = 'RSVP';
        this.setAttribute('aria-pressed', 'false');
      } else {
        this.classList.add('rsvp-done');
        this.textContent = '✓ Going';
        this.setAttribute('aria-pressed', 'true');
        showToast("You're going! Added to your calendar 📅");
      }
    });
  }
  
  // Clear form
  document.getElementById('event-name').value = '';
  document.getElementById('event-datetime').value = '';
  document.getElementById('event-venue').value = '';
  document.getElementById('event-category').value = 'Tech';
  document.getElementById('event-desc').value = '';
  
  closeModal('modal-event');
  showToast('Event created! 🎉');
}

// ══════════════════════════════════════════
// ── CREATE GROUP ──
// ══════════════════════════════════════════
function createGroup() {
  const name = document.getElementById('group-name').value.trim();
  const subject = document.getElementById('group-subject') ? document.getElementById('group-subject').value.trim() : '';
  const desc = document.getElementById('group-desc') ? document.getElementById('group-desc').value.trim() : '';
  if (!name) { showToast('Group name is required', '⚠️'); return; }

  const grid = document.getElementById('groups-grid') || document.querySelector('#page-groups .grid-3');
  if (!grid) { showToast('Study group created! 👥'); closeModal('modal-group'); return; }

  const card = document.createElement('div');
  card.className = 'group-card';
  card.innerHTML = `
    <div class="group-header">
      <div class="group-icon" aria-hidden="true">👥</div>
      <div class="group-info">
        <div class="group-name">${name}</div>
        <div class="group-members-count">1 member</div>
      </div>
    </div>
    ${desc ? `<div class="group-desc">${desc}</div>` : ''}
    <div class="group-footer">
      <div class="group-member-count">👥 1 member</div>
      <button class="btn btn-primary btn-sm" data-join aria-label="Join ${name}">Joined</button>
    </div>`;

  // wire join button
  card.querySelector('[data-join]').addEventListener('click', function() {
    if (this.textContent.trim() === 'Joined') {
      this.textContent = 'Join';
      this.className = this.className.replace('btn-primary','btn-secondary');
    } else {
      this.textContent = 'Joined';
      this.className = this.className.replace('btn-secondary','btn-primary');
      showToast('Joined! 🎓');
    }
  });

  grid.prepend(card);
  document.getElementById('group-name').value = '';
  if (document.getElementById('group-subject')) document.getElementById('group-subject').value = '';
  if (document.getElementById('group-desc')) document.getElementById('group-desc').value = '';
  closeModal('modal-group');
  showToast('Study group created! Invite your friends 👥');
}

// ══════════════════════════════════════════
// ── AI STUDY ASSISTANT ──
// ══════════════════════════════════════════
const AI_SYSTEM_PROMPT = `You are a helpful AI Study Assistant for college students on CampusConnect. 
You help with:
- Explaining difficult concepts clearly (Data Structures, Algorithms, Maths, Physics, etc.)
- Solving doubts and answering subject questions
- Summarizing topics for exam prep
- Giving study tips and mnemonics
- Breaking down complex problems step by step
Keep answers clear, concise and student-friendly. Use examples where helpful. Format with bullet points or steps when it aids clarity.`;

let aiChatHistory = [];

function appendAIMessage(role, text, isLoading = false) {
  const container = document.getElementById('ai-messages');
  if (!container) return null;
  const div = document.createElement('div');
  const isUser = role === 'user';
  div.style.cssText = `display:flex;flex-direction:column;align-items:${isUser ? 'flex-end' : 'flex-start'};gap:4px;`;
  div.innerHTML = `
    <div style="font-size:11px;color:var(--text3);padding:0 4px;">${isUser ? 'You' : '🤖 AI Assistant'}</div>
    <div style="max-width:80%;background:${isUser ? 'var(--accent)' : 'var(--surface2)'};color:${isUser ? '#fff' : 'var(--text1)'};
      padding:12px 16px;border-radius:${isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
      font-size:14px;line-height:1.6;border:${isUser ? 'none' : '1px solid var(--border)'};
      white-space:pre-wrap;word-break:break-word;">
      ${isLoading ? '<span class="ai-typing">Thinking…</span>' : text}
    </div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

async function sendAIMessage() {
  const input = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send-btn');
  const text = input.value.trim();
  if (!text) return;

  // Show user message
  appendAIMessage('user', text);
  aiChatHistory.push({ role: 'user', content: text });
  input.value = '';
  input.style.height = 'auto';

  // Show loading bubble
  sendBtn.disabled = true;
  sendBtn.textContent = '…';
  const loadingEl = appendAIMessage('assistant', '', true);

  try {
    // Get API key from localStorage or prompt user
    let apiKey = localStorage.getItem('cc_ai_key');
    if (!apiKey) {
      if (loadingEl) loadingEl.remove();
      apiKey = prompt('🔑 Enter your Anthropic API key to use AI Study Assistant:\n(Get one free at console.anthropic.com)\n\nYour key is saved locally and never sent anywhere except Anthropic.');
      if (!apiKey || !apiKey.trim().startsWith('sk-')) {
        appendAIMessage('assistant', '⚠️ Valid API key required. Get your free key at console.anthropic.com then try again.');
        sendBtn.disabled = false; sendBtn.textContent = 'Send ➤';
        return;
      }
      localStorage.setItem('cc_ai_key', apiKey.trim());
      appendAIMessage('assistant', '', true); // show loading again
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: AI_SYSTEM_PROMPT,
        messages: aiChatHistory
      })
    });

    if (response.status === 401) {
      localStorage.removeItem('cc_ai_key');
      if (loadingEl) loadingEl.remove();
      appendAIMessage('assistant', '❌ Invalid API key. Please refresh and enter a valid key from console.anthropic.com');
      sendBtn.disabled = false; sendBtn.textContent = 'Send ➤';
      return;
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not get a response. Please try again.';

    // Replace loading bubble with real reply
    if (loadingEl) loadingEl.remove();
    appendAIMessage('assistant', reply);
    aiChatHistory.push({ role: 'assistant', content: reply });

    // Keep history to last 20 messages to avoid token overflow
    if (aiChatHistory.length > 20) aiChatHistory = aiChatHistory.slice(-20);

  } catch (err) {
    if (loadingEl) loadingEl.remove();
    appendAIMessage('assistant', '⚠️ Error: ' + (err.message || 'Unknown error') + '\n\nTips:\n• Check your internet connection\n• Your API key may have expired — refresh page to re-enter\n• Check console for details');
    console.error('AI error:', err);
  }

  sendBtn.disabled = false;
  sendBtn.textContent = 'Send ➤';
}

// Send on Enter (Shift+Enter for newline)
document.addEventListener('DOMContentLoaded', () => {
  const aiInput = document.getElementById('ai-input');
  if (aiInput) {
    aiInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAIMessage();
      }
    });
  }

  // Show welcome message
  setTimeout(() => {
    const container = document.getElementById('ai-messages');
    if (container && container.children.length === 0) {
      appendAIMessage('assistant',
        `Hi! I'm your AI Study Assistant 👋\n\nI can help you with:\n• Explaining concepts (DSA, OS, CN, Maths…)\n• Solving doubts step by step\n• Summarizing topics for exams\n• Study tips and mnemonics\n\nWhat would you like to study today?`
      );
    }
  }, 300);
});
