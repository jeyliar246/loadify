window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loadingScreen').classList.add('hidden');
    loadSavedAddresses();
    loadRecentOrders();
    checkOnlineStatus();
  }, 500);
});
document.getElementById('currentYear').textContent = new Date().getFullYear();
const today = new Date().toISOString().split('T')[0];
document.getElementById('singleDate').min = today;
document.getElementById('bulkDate').min = today;
setInterval(() => {
  const riders = Math.floor(Math.random() * 5) + 8;
  document.getElementById('riderStatus').textContent = riders + ' Riders Available Now • Pickup in 30-45 mins';
}, 30000);

function showToast(message, type, duration) {
  if (!type) type = 'info';
  if (!duration) duration = 3000;
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function checkOnlineStatus() {
  const offlineBanner = document.getElementById('offlineBanner');
  if (!navigator.onLine) {
    offlineBanner.classList.add('show');
    showToast('You are offline. Some features may not work.', 'error');
  }
  window.addEventListener('online', () => { offlineBanner.classList.remove('show'); showToast('Back online!', 'success'); });
  window.addEventListener('offline', () => { offlineBanner.classList.add('show'); showToast('Connection lost. Working offline.', 'error'); });
}

function showHome() {
  document.getElementById('selectionScreen').classList.remove('hidden');
  document.getElementById('singleFormSection').classList.add('hidden');
  document.getElementById('bulkFormSection').classList.add('hidden');
  document.getElementById('trackingSection').classList.add('hidden');
  window.scrollTo(0, 0);
}

function showSingleForm() {
  document.getElementById('selectionScreen').classList.add('hidden');
  document.getElementById('singleFormSection').classList.remove('hidden');
  document.getElementById('bulkFormSection').classList.add('hidden');
  document.getElementById('trackingSection').classList.add('hidden');
  window.scrollTo(0, 0);
  updateSinglePrice();
}

function showBulkForm() {
  document.getElementById('selectionScreen').classList.add('hidden');
  document.getElementById('singleFormSection').classList.add('hidden');
  document.getElementById('bulkFormSection').classList.remove('hidden');
  document.getElementById('trackingSection').classList.add('hidden');
  window.scrollTo(0, 0);
  updateBulkPrice();
}

function showTracking() {
  document.getElementById('selectionScreen').classList.add('hidden');
  document.getElementById('singleFormSection').classList.add('hidden');
  document.getElementById('bulkFormSection').classList.add('hidden');
  document.getElementById('trackingSection').classList.remove('hidden');
  window.scrollTo(0, 0);
  simulateTracking();
}

function updateSinglePrice() {
  const pickupStops = document.querySelectorAll('#singleStops .stop-input').length;
  const dropoffStops = document.querySelectorAll('#singleDropoffs .dropoff-input').length;
  const isEmergency = document.getElementById('singleEmergency').checked;
  let basePrice = 3000;
  let extraPickupCost = (pickupStops - 1) * 2000;
  let extraDropoffCost = (dropoffStops - 1) * 3000;
  let total = basePrice + extraPickupCost + extraDropoffCost;
  if (isEmergency) total += 2000;
  document.getElementById('singlePriceEstimate').textContent = '₦' + total.toLocaleString();
  document.getElementById('priceBreakdown').textContent = pickupStops + ' pickup + ' + dropoffStops + ' drop-off' + (isEmergency ? ' + Emergency' : '');
}

function updateBulkPrice() {
  const count = parseInt(document.getElementById('bulkCount').value, 10) || 5;
  const isEmergency = document.getElementById('bulkEmergency').checked;
  let basePrice = count * 3000;
  let discount = basePrice * 0.10;
  let total = basePrice - discount;
  if (isEmergency) total += count * 500;
  document.getElementById('bulkPriceEstimate').textContent = '₦' + total.toLocaleString() + '+';
}

function saveOrder(orderData) {
  let orders = JSON.parse(localStorage.getItem('loadifyRecentOrders') || '[]');
  orders.unshift(Object.assign({}, orderData, { id: 'LD-' + Date.now().toString().slice(-6), date: new Date().toISOString(), status: 'pending' }));
  orders = orders.slice(0, 5);
  localStorage.setItem('loadifyRecentOrders', JSON.stringify(orders));
  loadRecentOrders();
}

function loadRecentOrders() {
  const orders = JSON.parse(localStorage.getItem('loadifyRecentOrders') || '[]');
  const section = document.getElementById('recentOrdersSection');
  const list = document.getElementById('recentOrdersList');
  const quickActions = document.getElementById('quickActions');
  if (orders.length > 0) {
    section.classList.remove('hidden');
    quickActions.classList.remove('hidden');
    list.innerHTML = orders.map(function(order) {
      return '<div onclick="repeatOrder(\'' + order.id + '\')" class="recent-order-card bg-white rounded-xl p-4 border border-gray-200 shadow-sm"><div class="flex items-center justify-between mb-2"><div class="flex items-center gap-2"><span class="w-8 h-8 ' + (order.type === 'single' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600') + ' rounded-lg flex items-center justify-center text-sm"><i class="fas ' + (order.type === 'single' ? 'fa-box' : 'fa-boxes') + '"></i></span><div><p class="font-semibold text-sm text-gray-900">' + (order.type === 'single' ? 'Single' : 'Bulk') + ' Delivery</p><p class="text-xs text-gray-500">' + new Date(order.date).toLocaleDateString() + '</p></div></div><span class="text-xs font-medium px-2 py-1 rounded-full ' + (order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700') + '">' + (order.status === 'delivered' ? 'Delivered' : 'Pending') + '</span></div><p class="text-xs text-gray-600 truncate">' + (order.item || order.item_description || '') + '</p></div>';
    }).join('');
  }
}

function clearRecentOrders() {
  if (confirm('Clear all recent orders?')) {
    localStorage.removeItem('loadifyRecentOrders');
    document.getElementById('recentOrdersSection').classList.add('hidden');
    document.getElementById('quickActions').classList.add('hidden');
    showToast('Recent orders cleared', 'success');
  }
}

function repeatOrder(orderId) {
  const orders = JSON.parse(localStorage.getItem('loadifyRecentOrders') || '[]');
  const order = orders.find(function(o) { return o.id === orderId; });
  if (order) {
    if (order.type === 'single') {
      showSingleForm();
      if (order.stops && order.stops[0]) document.getElementById('singleStop1').value = order.stops[0];
      if (order.dropoffs && order.dropoffs[0]) document.querySelector('#singleDropoffs .dropoff-input').value = order.dropoffs[0].address;
      document.getElementById('singleItem').value = order.item || '';
    } else {
      showBulkForm();
      document.getElementById('bulkPickup').value = order.pickup || '';
      document.getElementById('bulkItem').value = order.item_description || '';
      document.getElementById('bulkCount').value = order.count || 5;
    }
    showToast('Order details loaded. Review and submit!', 'success');
  }
}

function simulateTracking() {
  var steps = [{ status: 'Rider Assigned', progress: 25, time: 2000 }, { status: 'Picked Up', progress: 50, time: 5000 }, { status: 'In Transit', progress: 75, time: 8000 }, { status: 'Delivered', progress: 100, time: 12000 }];
  var currentStep = 0;
  function updateStep() {
    if (currentStep >= steps.length) return;
    var step = steps[currentStep];
    document.getElementById('trackingStatus').textContent = step.status;
    document.getElementById('trackingProgress').style.width = step.progress + '%';
    var timelineSteps = document.querySelectorAll('.tracking-step');
    timelineSteps.forEach(function(el, idx) {
      if (idx <= currentStep) {
        el.classList.add('active');
        var circle = el.querySelector('div:first-child');
        if (circle) { circle.classList.remove('bg-gray-200', 'text-gray-400'); circle.classList.add('bg-blue-600', 'text-white'); }
      }
    });
    currentStep++;
    if (currentStep < steps.length) setTimeout(updateStep, step.time);
  }
  setTimeout(updateStep, 2000);
}

function toggleSection(contentId, iconId) {
  const content = document.getElementById(contentId);
  const icon = document.getElementById(iconId);
  const button = content.previousElementSibling;
  if (content.classList.contains('hidden')) {
    content.classList.remove('hidden');
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
    button.setAttribute('aria-expanded', 'true');
  } else {
    content.classList.add('hidden');
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
    button.setAttribute('aria-expanded', 'false');
  }
}

function toggleEmergency(type) {
  const checkbox = document.getElementById(type + 'Emergency');
  checkbox.checked = !checkbox.checked;
  toggleEmergencyNote(type);
  if (type === 'single') updateSinglePrice(); else updateBulkPrice();
}

function toggleEmergencyNote(type) {
  const checkbox = document.getElementById(type + 'Emergency');
  const note = document.getElementById(type + 'EmergencyNote');
  const toggle = document.getElementById(type + 'EmergencyToggle');
  const dot = toggle.querySelector('span');
  if (checkbox.checked) {
    note.classList.add('show');
    toggle.classList.remove('bg-gray-300');
    toggle.classList.add('bg-red-600');
    dot.classList.add('translate-x-5');
  } else {
    note.classList.remove('show');
    toggle.classList.add('bg-gray-300');
    toggle.classList.remove('bg-red-600');
    dot.classList.remove('translate-x-5');
  }
}

function toggleHeavy(type) {
  const checkbox = document.getElementById(type + 'HeavyToggle');
  checkbox.checked = !checkbox.checked;
  toggleHeavyDetails(type);
}

function toggleHeavyDetails(type) {
  const checkbox = document.getElementById(type + 'HeavyToggle');
  const details = document.getElementById(type + 'HeavyDetails');
  const toggle = document.getElementById(type + 'HeavyToggleVisual');
  const dot = toggle ? toggle.querySelector('span') : null;
  if (checkbox.checked) {
    if (details) details.classList.remove('hidden');
    if (toggle) { toggle.classList.remove('bg-gray-300'); toggle.classList.add('bg-blue-600'); if (dot) dot.classList.add('translate-x-5'); }
  } else {
    if (details) details.classList.add('hidden');
    if (toggle) { toggle.classList.add('bg-gray-300'); toggle.classList.remove('bg-blue-600'); if (dot) dot.classList.remove('translate-x-5'); }
  }
}

function getSavedAddresses(type) {
  var key = type === 'single' ? 'loadifySingleAddresses' : 'loadifyBulkAddresses';
  var stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveAddresses(type, addresses) {
  var key = type === 'single' ? 'loadifySingleAddresses' : 'loadifyBulkAddresses';
  localStorage.setItem(key, JSON.stringify(addresses));
}

function saveCurrentAddress(type) {
  var address = '';
  var label = '';
  if (type === 'single') {
    var firstStop = document.getElementById('singleStop1');
    address = firstStop ? firstStop.value.trim() : '';
    label = 'Stop 1';
  } else {
    address = document.getElementById('bulkPickup').value.trim();
    label = 'Pickup';
  }
  if (!address) {
    showPopup('No Address to Save', 'Please type an address in the field first, then click "Save Current".');
    return;
  }
  var addresses = getSavedAddresses(type);
  if (addresses.some(function(a) { return a.address === address; })) {
    showPopup('Address Already Saved', 'This address is already in your saved list.');
    return;
  }
  var customLabel = prompt('Give this address a name (e.g., Home, Office, Store):', label);
  if (!customLabel) return;
  addresses.push({ label: customLabel, address: address, id: Date.now() });
  saveAddresses(type, addresses);
  renderSavedAddresses(type);
  showToast('"' + customLabel + '" saved!', 'success');
}

function deleteSavedAddress(type, id, event) {
  event.stopPropagation();
  if (!confirm('Delete this saved address?')) return;
  var addresses = getSavedAddresses(type).filter(function(a) { return a.id !== id; });
  saveAddresses(type, addresses);
  renderSavedAddresses(type);
  showToast('Address deleted', 'info');
}

function selectSavedAddress(type, address) {
  if (type === 'single') {
    var firstStop = document.getElementById('singleStop1');
    if (firstStop) firstStop.value = address;
  } else {
    document.getElementById('bulkPickup').value = address;
  }
  showToast('Address selected', 'success');
}

function renderSavedAddresses(type) {
  const container = document.getElementById(type + 'SavedAddresses');
  const noSavedMsg = document.getElementById(type + 'NoSaved');
  const addresses = getSavedAddresses(type);
  if (addresses.length === 0) {
    container.innerHTML = '';
    noSavedMsg.style.display = 'block';
    return;
  }
  noSavedMsg.style.display = 'none';
  container.innerHTML = addresses.map(function(addr) {
    return '<button type="button" onclick="selectSavedAddress(\'' + type + '\', \'' + addr.address.replace(/'/g, "\\'") + '\')" class="saved-address flex-shrink-0 px-4 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-2 bg-white shadow-sm relative group"><i class="fas fa-map-marker-alt ' + (type === 'single' ? 'text-blue-500' : 'text-green-500') + '"></i><span>' + addr.label + '</span><span class="delete-saved" onclick="deleteSavedAddress(\'' + type + '\', ' + addr.id + ', event)"><i class="fas fa-times"></i></span></button>';
  }).join('');
}

function loadSavedAddresses() {
  renderSavedAddresses('single');
  renderSavedAddresses('bulk');
}

var stopCount = 1;
function addStop(type) {
  if (type === 'single') {
    stopCount++;
    const container = document.getElementById('singleStops');
    const newStop = document.createElement('div');
    newStop.className = 'flex gap-2 stop-item';
    newStop.innerHTML = '<input type="text" name="stop[]" placeholder="Stop ' + stopCount + ': Pickup address" required class="stop-input flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" aria-required="true" onchange="updateSinglePrice()"><button type="button" onclick="this.parentElement.remove(); stopCount--; updateSinglePrice();" class="text-red-500 px-2 hover:text-red-700" aria-label="Remove stop"><i class="fas fa-times"></i></button>';
    container.appendChild(newStop);
    updateSinglePrice();
  }
}

var dropoffCount = 1;
function addDropoff() {
  dropoffCount++;
  const container = document.getElementById('singleDropoffs');
  const newDropoff = document.createElement('div');
  newDropoff.className = 'flex gap-2 dropoff-item';
  newDropoff.innerHTML = '<div class="flex-1 space-y-2"><input type="text" name="dropoff[]" placeholder="Drop-off ' + dropoffCount + ': Delivery address *" required class="dropoff-input w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"><input type="tel" name="dropoff_phone[]" placeholder="Receiver phone for this address (Optional)" class="dropoff-phone w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" pattern="[0-9]{11}"></div><button type="button" onclick="this.parentElement.remove(); dropoffCount--; updateSinglePrice();" class="text-red-500 px-2 hover:text-red-700 self-start mt-3" aria-label="Remove dropoff"><i class="fas fa-times"></i></button>';
  container.appendChild(newDropoff);
  updateSinglePrice();
}

function checkTimeAndShowPopup(timeString, type) {
  if (!timeString) return true;
  var hour = parseInt(timeString.split(':')[0], 10);
  var minute = parseInt(timeString.split(':')[1], 10) || 0;
  var timeValue = hour + (minute / 60);
  if (timeValue < 8) return true;
  if (timeValue >= 8 && timeValue < 12) {
    showPopup('Pickup Time Adjustment', "You've scheduled for " + hour + ':' + String(minute).padStart(2, '0') + '. Our next available pickup slot is 12:00 PM (noon). Your delivery will likely be today if picked up by 12 PM.');
    return false;
  }
  if (timeValue >= 12 && timeValue < 16) {
    showPopup('Pickup Time Adjustment', "You've scheduled for " + hour + ':' + String(minute).padStart(2, '0') + '. Our next available pickup slot is 4:00 PM. Delivery will likely be today if picked up by 4 PM.');
    return false;
  }
  showPopup('Next Day Delivery', "You've scheduled for " + hour + ':' + String(minute).padStart(2, '0') + '. This is after our last pickup slot (4 PM). Pickup will be tomorrow morning and delivery will be next day.');
  return false;
}

function updateETA(type) {
  const date = document.getElementById(type + 'Date').value;
  const time = document.getElementById(type + 'Time').value;
  const etaElement = document.getElementById(type + 'ETATime');
  if (!date) {
    etaElement.textContent = type === 'single' ? 'Today by 6:00 PM' : '24-48 hours';
    return;
  }
  const selectedDate = new Date(date);
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  if (type === 'single') {
    if (selectedDate.getTime() === todayDate.getTime()) {
      etaElement.textContent = (time && parseInt(time.split(':')[0], 10) >= 16) ? 'Tomorrow by 6:00 PM' : 'Today by 6:00 PM';
    } else {
      var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      etaElement.textContent = days[selectedDate.getDay()] + ' by 6:00 PM';
    }
  } else {
    etaElement.textContent = '24-48 hours';
  }
}

document.getElementById('singleDate').addEventListener('change', function() { updateETA('single'); });
document.getElementById('singleTime').addEventListener('change', function() { updateETA('single'); });
document.getElementById('bulkDate').addEventListener('change', function() { updateETA('bulk'); });

function showPopup(title, message) {
  document.getElementById('popupTitle').textContent = title;
  document.getElementById('popupMessage').textContent = message;
  document.getElementById('popupModal').classList.remove('hidden');
  document.getElementById('popupModal').classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closePopup(action) {
  document.getElementById('popupModal').classList.add('hidden');
  document.getElementById('popupModal').classList.remove('flex');
  document.body.style.overflow = '';
  if (action === 'cancel') return;
  const singleForm = document.getElementById('singleForm');
  const bulkForm = document.getElementById('bulkForm');
  if (singleForm.dataset.pending === 'true') {
    saveOrder({ type: 'single', stops: JSON.parse(singleForm.dataset.stops), dropoffs: JSON.parse(singleForm.dataset.dropoffs), item: singleForm.dataset.item, count: singleForm.dataset.count, isEmergency: singleForm.dataset.isEmergency === 'true', isHeavy: singleForm.dataset.isHeavy === 'true' });
    sendSingleToWhatsApp(JSON.parse(singleForm.dataset.stops), JSON.parse(singleForm.dataset.dropoffs), singleForm.dataset.item, singleForm.dataset.count, singleForm.dataset.isEmergency === 'true', singleForm.dataset.isHeavy === 'true', singleForm.dataset.heavyDesc, singleForm.dataset.weight, singleForm.dataset.date, singleForm.dataset.time, singleForm.dataset.itemValue);
    singleForm.dataset.pending = 'false';
    singleForm.dataset.timePopupShown = 'false';
  }
  if (bulkForm.dataset.pending === 'true') {
    if (bulkForm.dataset.timePopupShown === 'true') {
      showPopup('Bulk Delivery Confirmation', 'You are booking a bulk delivery of ' + bulkForm.dataset.count + ' packages of "' + bulkForm.dataset.item + '". Please ensure EVERY package has its drop-off address boldly written on it. Our rider will pick up from ' + bulkForm.dataset.pickup + ' and deliver within 24-48 hours.');
      bulkForm.dataset.timePopupShown = 'false';
      return;
    }
    saveOrder({ type: 'bulk', pickup: bulkForm.dataset.pickup, item_description: bulkForm.dataset.item, count: bulkForm.dataset.count, isEmergency: bulkForm.dataset.isEmergency === 'true' });
    sendBulkToWhatsApp(bulkForm.dataset.pickup, bulkForm.dataset.receiverPhone, bulkForm.dataset.item, bulkForm.dataset.count, bulkForm.dataset.mainland, bulkForm.dataset.island, bulkForm.dataset.isEmergency === 'true', bulkForm.dataset.date, bulkForm.dataset.time);
    bulkForm.dataset.pending = 'false';
  }
}

function sendSingleToWhatsApp(stops, dropoffs, item, count, isEmergency, isHeavy, heavyDesc, weight, date, time, itemValue) {
  var phone = '2349045555020';
  var message = 'Hi Loadify, I want to book a SINGLE DELIVERY' + (isEmergency ? ' 🚨 EMERGENCY' : '') + '.\n\n';
  if (stops.length > 0) {
    message += '📍 PICKUP STOPS (' + stops.length + '):\n';
    stops.forEach(function(stop, idx) { message += (idx + 1) + '. ' + stop + '\n'; });
    message += '\n';
  }
  message += '📍 DROP-OFF STOPS (' + dropoffs.length + '):\n';
  dropoffs.forEach(function(dropoff, idx) {
    message += (idx + 1) + '. ' + dropoff.address;
    if (dropoff.phone) message += ' (📞 ' + dropoff.phone + ')';
    message += '\n';
  });
  message += '\n📦 Item(s): ' + item + '\n📦 Total Packages: ' + count + '\n';
  if (itemValue) message += '💰 Est. Value: ₦' + itemValue + '\n';
  if (isHeavy) {
    message += '\n⚠️ HEAVY ITEM (10kg+):\n';
    if (heavyDesc) message += 'Description: ' + heavyDesc + '\n';
    if (weight) message += 'Weight: ' + weight + 'kg\n';
  }
  if (date && time) message += '\n📅 Scheduled: ' + date + ' at ' + time + '\n';
  else if (date) message += '\n📅 Date: ' + date + ' (ASAP)\n';
  else message += '\n⏰ ASAP pickup requested\n';
  if (isEmergency) message += '\n🚨 EMERGENCY DELIVERY - Extra charges apply\n';
  message += '\nPlease confirm availability and send quote.';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');
  showToast('Opening WhatsApp...', 'success');
  setTimeout(function() { showTracking(); }, 2000);
}

function sendBulkToWhatsApp(pickup, receiverPhone, item, count, mainland, island, isEmergency, date, time) {
  var phone = '2349045555020';
  var message = 'Hi Loadify, I want to book a BULK DELIVERY' + (isEmergency ? ' 🚨 EMERGENCY' : '') + '.\n\n';
  message += '📦 Item(s): ' + item + '\n📍 Pickup: ' + pickup + '\n';
  if (receiverPhone) message += '📞 Contact: ' + receiverPhone + '\n';
  message += '📦 Total Packages: ' + count + '\n';
  if (parseInt(mainland, 10) > 0 || parseInt(island, 10) > 0) {
    message += '\n📍 Breakdown:\n';
    if (parseInt(mainland, 10) > 0) message += '• To Mainland: ' + mainland + '\n';
    if (parseInt(island, 10) > 0) message += '• To Island: ' + island + '\n';
  }
  if (date && time) message += '\n📅 Scheduled: ' + date + ' at ' + time + '\n';
  else if (date) message += '\n📅 Date: ' + date + ' (ASAP)\n';
  else message += '\n⏰ Pickup: As soon as possible\n';
  if (isEmergency) message += '\n🚨 EMERGENCY DELIVERY - Extra charges apply\n';
  message += '\n✅ All packages have addresses boldly written on them.\n📍 Delivery within 24-48 hours.\n\nPlease confirm and send quote with 10% discount.';
  window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(message), '_blank');
  showToast('Opening WhatsApp...', 'success');
}

document.getElementById('singleForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var stops = Array.from(document.querySelectorAll('#singleStops .stop-input')).map(function(i) { return i.value; }).filter(function(v) { return v; });
  var dropoffInputs = document.querySelectorAll('#singleDropoffs .dropoff-input');
  var dropoffPhones = document.querySelectorAll('#singleDropoffs .dropoff-phone');
  var dropoffs = Array.from(dropoffInputs).map(function(input, idx) {
    return { address: input.value.trim(), phone: dropoffPhones[idx] ? dropoffPhones[idx].value.trim() : '' };
  }).filter(function(d) { return d.address; });
  var item = document.getElementById('singleItem').value.trim();
  var count = document.getElementById('singleCount').value;
  var isEmergency = document.getElementById('singleEmergency').checked;
  var isHeavy = document.getElementById('singleHeavyToggle').checked;
  var heavyDesc = document.getElementById('singleHeavyDesc').value.trim();
  var weight = document.getElementById('singleWeight').value;
  var date = document.getElementById('singleDate').value;
  var time = document.getElementById('singleTime').value;
  var itemValue = document.getElementById('singleValue').value;
  if (stops.length === 0) {
    showPopup('Missing Pickup Address', 'Please enter at least one pickup address.');
    return;
  }
  if (dropoffs.length === 0) {
    showPopup('Missing Drop-off Address', 'Please enter at least one drop-off address.');
    return;
  }
  if (!item) {
    showPopup('Missing Item Description', 'Please describe what we are picking up.');
    return;
  }
  if (time && !checkTimeAndShowPopup(time, 'single')) {
    this.dataset.pending = 'true';
    this.dataset.stops = JSON.stringify(stops);
    this.dataset.dropoffs = JSON.stringify(dropoffs);
    this.dataset.item = item;
    this.dataset.count = count;
    this.dataset.isEmergency = isEmergency;
    this.dataset.isHeavy = isHeavy;
    this.dataset.heavyDesc = heavyDesc;
    this.dataset.weight = weight;
    this.dataset.date = date;
    this.dataset.time = time;
    this.dataset.itemValue = itemValue;
    this.dataset.timePopupShown = 'true';
    return;
  }
  saveOrder({ type: 'single', stops: stops, dropoffs: dropoffs, item: item, count: count, isEmergency: isEmergency, isHeavy: isHeavy });
  sendSingleToWhatsApp(stops, dropoffs, item, count, isEmergency, isHeavy, heavyDesc, weight, date, time, itemValue);
});

document.getElementById('bulkForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var pickup = document.getElementById('bulkPickup').value.trim();
  var receiverPhone = document.getElementById('bulkReceiverPhone').value.trim();
  var item = document.getElementById('bulkItem').value.trim();
  var count = parseInt(document.getElementById('bulkCount').value, 10);
  var mainland = document.getElementById('bulkMainland').value || 0;
  var island = document.getElementById('bulkIsland').value || 0;
  var isEmergency = document.getElementById('bulkEmergency').checked;
  var date = document.getElementById('bulkDate').value;
  var time = document.getElementById('bulkTime').value;
  if (!pickup) {
    showPopup('Missing Pickup Address', 'Please enter the pickup address.');
    return;
  }
  if (!item) {
    showPopup('Missing Item Description', 'Please describe what items we are picking up.');
    return;
  }
  if (!count || count < 5) {
    showPopup('Minimum Package Requirement', 'Bulk delivery requires a minimum of 5 packages.');
    return;
  }
  var totalBreakdown = parseInt(mainland, 10) + parseInt(island, 10);
  if (totalBreakdown > 0 && totalBreakdown !== count) {
    showPopup('Package Count Mismatch', 'Your breakdown total does not match total packages. Please ensure the numbers match.');
    return;
  }
  if (time && !checkTimeAndShowPopup(time, 'bulk')) {
    this.dataset.pending = 'true';
    this.dataset.pickup = pickup;
    this.dataset.receiverPhone = receiverPhone;
    this.dataset.item = item;
    this.dataset.count = count;
    this.dataset.mainland = mainland;
    this.dataset.island = island;
    this.dataset.isEmergency = isEmergency;
    this.dataset.date = date;
    this.dataset.time = time;
    this.dataset.timePopupShown = 'true';
    return;
  }
  showPopup('Bulk Delivery Confirmation', 'You are booking a bulk delivery of ' + count + ' packages of "' + item + '". Please ensure EVERY package has its drop-off address boldly written on it. Our rider will pick up from ' + pickup + ' and deliver within 24-48 hours.');
  this.dataset.pending = 'true';
  this.dataset.pickup = pickup;
  this.dataset.receiverPhone = receiverPhone;
  this.dataset.item = item;
  this.dataset.count = count;
  this.dataset.mainland = mainland;
  this.dataset.island = island;
  this.dataset.isEmergency = isEmergency;
  this.dataset.date = date;
  this.dataset.time = time;
});

document.getElementById('popupModal').addEventListener('click', function(e) {
  if (e.target === this) closePopup('cancel');
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && !document.getElementById('popupModal').classList.contains('hidden')) closePopup('cancel');
});
