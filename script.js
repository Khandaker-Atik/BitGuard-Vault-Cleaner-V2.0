
let processedJSON = null;
let originalItemCount = 0;
let finalItemCount = 0;


document.addEventListener('DOMContentLoaded', function() {

    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.classList.add('animate__animated');
        section.style.animationDelay = `${index * 0.2}s`;
        section.classList.add('animate__fadeInUp');
    });
    
    
    const jsonInput = document.getElementById('jsonInput');
    jsonInput.addEventListener('input', function() {
        if (jsonInput.value.trim() !== '') {
            document.getElementById('processBtn').classList.add('pulse-animation');
        } else {
            document.getElementById('processBtn').classList.remove('pulse-animation');
        }
    });
});


function processJSON() {
    const input = document.getElementById('jsonInput').value;
    
    try {
        let data = JSON.parse(input);
        originalItemCount = data.items.length;
        
        let newData = { ...data, "items": [] };
        let uniqueMap = new Map();
        
        data.items.sort((a, b) => {
            const dateA = new Date(a.revisionDate || 0);
            const dateB = new Date(b.revisionDate || 0);
            return dateB - dateA;
        });
        

        data.items.forEach(item => {
           
            const key = `${item.name}|${item.login?.username || ''}`;
            
           
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, true);
                newData.items.push(item);
            }
        });
        
  
        finalItemCount = newData.items.length;
        updateStats(originalItemCount, originalItemCount - finalItemCount, finalItemCount);
        
       
        processedJSON = JSON.stringify(newData, null, 4);
        document.getElementById('jsonOutput').value = processedJSON;
        
      
        document.getElementById('downloadBtn').disabled = false;
        document.getElementById('copyBtn').disabled = false;
        
      
        showToast('JSON processed successfully! Duplicates have been removed.');
        
      
        document.querySelector('.output-section').scrollIntoView({ behavior: 'smooth' });
        
       
        const outputSection = document.querySelector('.output-section .card');
        outputSection.classList.add('highlight-animation');
        setTimeout(() => {
            outputSection.classList.remove('highlight-animation');
        }, 1500);
        
    } catch (error) {
        console.error('Error processing JSON:', error);
        showToast('Error: Invalid JSON data. Please check your input and try again.', 'error');
    }
}


function updateStats(original, duplicates, final) {
    document.getElementById('originalCount').textContent = original;
    document.getElementById('duplicatesCount').textContent = duplicates;
    document.getElementById('finalCount').textContent = final;
    
 
    const stats = document.querySelectorAll('.stat-value');
    stats.forEach(stat => {
        stat.classList.add('pulse-once');
        setTimeout(() => {
            stat.classList.remove('pulse-once');
        }, 1000);
    });
}


function downloadJSON() {
    if (!processedJSON) return;
    
    const blob = new Blob([processedJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `bitwarden_cleaned_${timestamp}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    
    showToast('Downloaded JSON file successfully!');
}


function copyToClipboard() {
    const jsonOutput = document.getElementById('jsonOutput');
    jsonOutput.select();
    document.execCommand('copy');
    
    showToast('Copied to clipboard!');
}


function clearAll() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('jsonOutput').value = '';
    document.getElementById('downloadBtn').disabled = true;
    document.getElementById('copyBtn').disabled = true;
  
    document.getElementById('originalCount').textContent = '0';
    document.getElementById('duplicatesCount').textContent = '0';
    document.getElementById('finalCount').textContent = '0';
    
    processedJSON = null;
    originalItemCount = 0;
    finalItemCount = 0;
    
    showToast('All data cleared!');
}


function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    const toastProgress = document.getElementById('toastProgress');
    const icon = toast.querySelector('i');

    if (type === 'success') {
        icon.className = 'fas fa-check-circle';
        icon.style.color = 'var(--success-color)';
    } else if (type === 'error') {
        icon.className = 'fas fa-exclamation-circle';
        icon.style.color = 'var(--danger-color)';
    }
    

    toastMessage.textContent = message;
    

    toast.classList.add('show');
    
 r
    toastProgress.style.width = '100%';
    setTimeout(() => {
        toastProgress.style.width = '0';
    }, 100);
    

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


const styleSheet = document.createElement('style');
styleSheet.innerHTML = `
    @keyframes pulse-once {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes pulse-animation {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .pulse-once {
        animation: pulse-once 0.5s ease-in-out;
    }
    
    .pulse-animation {
        animation: pulse-animation 1.5s infinite;
    }
    
    .highlight-animation {
        animation: highlight 1.5s ease-in-out;
    }
    
    @keyframes highlight {
        0% { box-shadow: 0 0 0 rgba(58, 134, 255, 0); }
        50% { box-shadow: 0 0 20px rgba(58, 134, 255, 0.8); }
        100% { box-shadow: 0 0 0 rgba(58, 134, 255, 0); }
    }
`;
document.head.appendChild(styleSheet);


const hasLocalStorage = (function() {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
})();


if (hasLocalStorage) {
    
    window.addEventListener('load', function() {
        const savedInput = localStorage.getItem('bitguard_input');
        if (savedInput) {
            const jsonInput = document.getElementById('jsonInput');
            jsonInput.value = savedInput;
        }
    });
    
    
    document.getElementById('processBtn').addEventListener('click', function() {
        const jsonInput = document.getElementById('jsonInput');
        if (jsonInput.value.trim() !== '') {
            localStorage.setItem('bitguard_input', jsonInput.value);
        }
    });
    
    
    document.getElementById('clearBtn').addEventListener('click', function() {
        localStorage.removeItem('bitguard_input');
    });
}
