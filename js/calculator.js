/**
 * ==========================================================================
 * تطبيق الآلة الحاسبة الذكية - المحرك الرئيسي المتقدم (Calculator Core Engine)
 * ==========================================================================
 * كود محرك الحاسبة الرئيسي مكتوب بـ Vanilla JavaScript (ES6).
 * دعم الوضع القياسي، الوضع العلمي، الأوضاع الصوتية، واختصارات الكيبورد المتقدمة.
 */

class Calculator {
  constructor() {
    // حالة الحاسبة الداخلية
    this.currentInput = '0';
    this.expression = '';
    this.isEvaluated = false;
    this.isError = false;
    this.activeMode = 'basic'; // basic | scientific | converter | discount

    // عناصر الواجهة DOM
    this.expressionDisplay = document.getElementById('expression-display');
    this.resultDisplay = document.getElementById('result-display');
    this.displayContainer = document.getElementById('display-container');

    // التهيئة البدائية
    this.init();
  }

  /**
   * تهيئة الحاسبة وتوليد الأحداث
   */
  init() {
    this.bindEvents();
    this.setupModeSwitching();
    this.setupModalEvents();
    this.setupKeyboardListeners();
    this.updateDisplay();
    this.hideLoadingOverlay();
  }

  /**
   * إخفاء شاشة التحميل الأولية عند اكتمال التحميل
   */
  hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      setTimeout(() => {
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 500);
      }, 400);
    }
  }

  /**
   * إعداد التبديل بين الأوضاع المختلفة (Tabs)
   */
  setupModeSwitching() {
    const modeTabs = document.querySelectorAll('.mode-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetMode = e.currentTarget.dataset.mode;
        this.switchMode(targetMode);
        if (window.SoundManager) window.SoundManager.playClick(750, 0.04);
      });
    });
  }

  /**
   * التبديل للوضع المستهدف
   * @param {string} mode - اسم الوضع
   */
  switchMode(mode) {
    this.activeMode = mode;
    
    // تحديث علامات التبويب النشطة
    document.querySelectorAll('.mode-tab').forEach(tab => {
      if (tab.dataset.mode === mode) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // إخفاء وإظهار الألواح المناسبة
    const basicKeypad = document.getElementById('keypad-grid-basic');
    const sciKeypad = document.getElementById('keypad-grid-sci');
    const converterPanel = document.getElementById('converter-panel');
    const discountPanel = document.getElementById('discount-panel');

    if (this.displayContainer) {
      this.displayContainer.style.display = (mode === 'basic' || mode === 'scientific') ? 'flex' : 'none';
    }

    if (basicKeypad) basicKeypad.style.display = (mode === 'basic') ? 'grid' : 'none';
    if (sciKeypad) sciKeypad.style.display = (mode === 'scientific') ? 'grid' : 'none';
    if (converterPanel) converterPanel.style.display = (mode === 'converter') ? 'block' : 'none';
    if (discountPanel) discountPanel.style.display = (mode === 'discount') ? 'block' : 'none';

    // إعادة ضبط الحالات عند التبديل
    if (mode === 'converter' && window.ConverterManager) {
      window.ConverterManager.populateUnits();
      window.ConverterManager.convertUnits();
    } else if (mode === 'discount' && window.ConverterManager) {
      window.ConverterManager.calculateDiscount();
    }
  }

  /**
   * ربط أزرار الحاسبة في الواجهة بالأحداث
   */
  bindEvents() {
    // ربط كافة أزرار الكيباد الحسابية
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const action = btn.dataset.action;
      const value = btn.dataset.value;

      if (action) {
        this.handleButtonPress(action, value, btn);
      }
    });

    // زر نسخ النتيجة
    const copyBtn = document.getElementById('copy-result-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.copyResult();
        if (window.SoundManager) window.SoundManager.playClick(900, 0.04);
      });
    }

    // زر ملء الشاشة
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        this.toggleFullscreen();
        if (window.SoundManager) window.SoundManager.playClick(800, 0.04);
      });
    }
  }

  /**
   * ربط أحداث النوافذ المنبثقة Modals
   */
  setupModalEvents() {
    const helpBtn = document.getElementById('help-btn');
    const modal = document.getElementById('shortcuts-modal');
    const closeBtn = document.getElementById('close-modal-btn');

    if (helpBtn && modal) {
      helpBtn.addEventListener('click', () => {
        modal.classList.add('show');
        if (window.SoundManager) window.SoundManager.playClick(800, 0.04);
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('show');
        }
      });
    }
  }

  /**
   * التكفّل بمنطق الضغط على الأزرار
   * @param {string} action - نوع الزر
   * @param {string} value - قيمة الزر
   * @param {HTMLElement} btnElement - عنصر الزر للتحريك
   */
  handleButtonPress(action, value, btnElement = null) {
    if (btnElement) {
      this.animateButton(btnElement);
    }

    // أصوات ضغطات الأزرار
    if (window.SoundManager) {
      if (action === 'equals') {
        window.SoundManager.playEquals();
      } else if (action === 'operator') {
        window.SoundManager.playOperator();
      } else {
        window.SoundManager.playClick(650, 0.04);
      }
    }

    // إذا كانت هناك حالة خطأ قائمة، أي ضغط لزر يسفر عن إعادة تعيين الحاسبة
    if (this.isError && action !== 'clear') {
      this.clearAll();
    }

    switch (action) {
      case 'number':
        this.appendNumber(value);
        break;
      case 'operator':
        this.appendOperator(value);
        break;
      case 'sci-func':
        this.appendSciFunction(value);
        break;
      case 'sci-const':
        this.appendSciConst(value);
        break;
      case 'decimal':
        this.appendDecimal();
        break;
      case 'percent':
        this.handlePercent();
        break;
      case 'clear':
        this.clearAll();
        break;
      case 'delete':
        this.deleteLast();
        break;
      case 'equals':
        this.evaluate();
        break;
    }

    this.updateDisplay();
  }

  /**
   * إدخال الأرقام (0-9 و 00)
   * @param {string} num - الرقم المدخل
   */
  appendNumber(num) {
    if (this.isEvaluated) {
      this.currentInput = num === '00' ? '0' : num;
      this.expression = '';
      this.isEvaluated = false;
      return;
    }

    if (this.currentInput === '0') {
      if (num === '00') return;
      this.currentInput = num;
    } else {
      if (this.currentInput.length >= 24) return;
      this.currentInput += num;
    }
  }

  /**
   * إضافة النقطة العشرية مع منع التكرار
   */
  appendDecimal() {
    if (this.isEvaluated) {
      this.currentInput = '0.';
      this.expression = '';
      this.isEvaluated = false;
      return;
    }

    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }
  }

  /**
   * إضافة العمليات الحسابية (+, -, ×, ÷)
   * @param {string} op - رمز العملية
   */
  appendOperator(op) {
    if (this.isEvaluated) {
      this.expression = `${this.currentInput} ${op} `;
      this.currentInput = '0';
      this.isEvaluated = false;
      return;
    }

    if (this.currentInput === '0' || this.currentInput === '') {
      if (this.expression !== '') {
        const trimmed = this.expression.trim();
        const lastChar = trimmed.slice(-1);
        if (['+', '-', '×', '÷'].includes(lastChar)) {
          this.expression = trimmed.slice(0, -1) + `${op} `;
          return;
        }
      }
    }

    this.expression += `${this.currentInput} ${op} `;
    this.currentInput = '0';
  }

  /**
   * إضافة الدوال العلمية (sin, cos, tan, log, ln, sqrt, square, factorial, brackets)
   * @param {string} fn - اسم أو رمز الدالة العلمية
   */
  appendSciFunction(fn) {
    if (this.isEvaluated) {
      this.expression = '';
      this.isEvaluated = false;
    }

    switch (fn) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'log':
      case 'ln':
      case '√':
        if (this.currentInput !== '0' && this.currentInput !== '') {
          this.expression += `${fn}(${this.currentInput}) `;
          this.currentInput = '0';
        } else {
          this.expression += `${fn}(`;
        }
        break;

      case 'sqr': // x²
        if (this.currentInput !== '0') {
          this.expression += `${this.currentInput}² `;
          this.currentInput = '0';
        } else if (this.expression !== '') {
          this.expression = this.expression.trim() + `² `;
        }
        break;

      case 'fact': // n!
        if (this.currentInput !== '0') {
          this.expression += `${this.currentInput}! `;
          this.currentInput = '0';
        } else if (this.expression !== '') {
          this.expression = this.expression.trim() + `! `;
        }
        break;

      case '(':
        if (this.currentInput !== '0' && this.currentInput !== '') {
          this.expression += `${this.currentInput} × ( `;
          this.currentInput = '0';
        } else {
          this.expression += `( `;
        }
        break;

      case ')':
        this.expression += `${this.currentInput} ) `;
        this.currentInput = '0';
        break;
    }
  }

  /**
   * إضافة الثوابت الرياضية (π, e)
   * @param {string} c - رمز الثابت
   */
  appendSciConst(c) {
    const val = c === 'π' ? 'π' : 'e';
    if (this.currentInput === '0' || this.isEvaluated) {
      this.currentInput = val;
      this.isEvaluated = false;
    } else {
      this.expression += `${this.currentInput} × `;
      this.currentInput = val;
    }
  }

  /**
   * حساب النسبة المئوية %
   */
  handlePercent() {
    let value = parseFloat(this.currentInput);
    if (isNaN(value) || value === 0) return;

    value = value / 100;
    this.currentInput = String(value);
  }

  /**
   * حذف آخر رقم تم إدخاله (DEL)
   */
  deleteLast() {
    if (this.isEvaluated) {
      this.clearAll();
      return;
    }

    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
    } else {
      this.currentInput = '0';
    }
  }

  /**
   * مسح الشاشة والبيانات بالكامل (C)
   */
  clearAll() {
    this.currentInput = '0';
    this.expression = '';
    this.isEvaluated = false;
    this.isError = false;
    if (this.resultDisplay) {
      this.resultDisplay.classList.remove('error');
    }
  }

  /**
   * حساب النتيجة = وتنفيذ المعادلة الرياضية
   */
  evaluate() {
    if (this.expression === '' && !this.isEvaluated) return;

    let fullExpression = this.expression + this.currentInput;
    fullExpression = fullExpression.trim();
    if (!fullExpression) return;

    let sanitizedExpr = fullExpression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/²/g, '**2')
      .replace(/π/g, 'Math.PI')
      .replace(/\be\b/g, 'Math.E')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/√\(/g, 'Math.sqrt(');

    // إغلاق الأقواس المفتوحة تلقائياً في حال نسيان إغلاقها
    const openParens = (sanitizedExpr.match(/\(/g) || []).length;
    const closeParens = (sanitizedExpr.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      sanitizedExpr += ')'.repeat(openParens - closeParens);
    }

    // معالجة العاملي Factorial n!
    sanitizedExpr = sanitizedExpr.replace(/(\d+)!/g, (match, num) => {
      return this.factorial(parseInt(num));
    });

    // التحقق من حالة القسمة على صفر
    if (/\/ *0+(\.0+)?(?![1-9])/.test(sanitizedExpr)) {
      this.triggerError('Cannot divide by zero');
      return;
    }

    try {
      let result = this.safeEval(sanitizedExpr);

      if (isNaN(result) || !isFinite(result)) {
        this.triggerError('Math Error');
        return;
      }

      result = Math.round(result * 1e10) / 1e10;
      const resultString = String(result);

      // حفظ العملية في سجل العمليات History
      if (window.HistoryManager) {
        window.HistoryManager.addEntry(fullExpression, resultString);
      }

      this.expression = `${fullExpression} =`;
      this.currentInput = resultString;
      this.isEvaluated = true;

      // إضافة حركة انيميشن للنتيجة
      if (this.resultDisplay) {
        this.resultDisplay.classList.remove('result-bounce');
        void this.resultDisplay.offsetWidth; // Trigger Reflow
        this.resultDisplay.classList.add('result-bounce');
      }
    } catch (err) {
      console.error('Eval Exception:', err);
      this.triggerError('Invalid Expression');
    }
  }

  /**
   * حساب العاملي n!
   */
  factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) {
      res *= i;
    }
    return res;
  }

  /**
   * تنفيذ الحساب بأمان بعيداً عن eval العادية
   * @param {string} expr - التعبير الرياضي
   */
  safeEval(expr) {
    if (!/^[0-9+\-*/. ()Matha-zA-Z!*,]+$/.test(expr)) {
      throw new Error('Invalid Input');
    }
    return Function(`'use strict'; return (${expr})`)();
  }

  /**
   * إظهار حالة الخطأ في الشاشة
   * @param {string} message - رسالة الخطأ
   */
  triggerError(message) {
    this.currentInput = message;
    this.isError = true;
    this.isEvaluated = true;

    if (window.SoundManager) {
      window.SoundManager.playError();
    }

    if (this.resultDisplay) {
      this.resultDisplay.classList.add('error');
    }

    if (this.displayContainer) {
      this.displayContainer.classList.remove('shake');
      void this.displayContainer.offsetWidth; // Trigger reflow
      this.displayContainer.classList.add('shake');
    }
  }

  /**
   * تحديث شاشة العرض (Display UI)
   */
  updateDisplay() {
    if (this.expressionDisplay) {
      this.expressionDisplay.textContent = this.expression;
    }
    if (this.resultDisplay) {
      this.resultDisplay.textContent = this.currentInput;
    }
  }

  /**
   * تحميل نتيجة عملية سابقة من السجل
   * @param {string} val - قيمة النتيجة
   */
  loadHistoryItem(val) {
    this.clearAll();
    this.currentInput = val;
    this.updateDisplay();
  }

  /**
   * دعم لوحة المفاتيح (Keyboard Events)
   */
  setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const key = e.key;

      if (key === '?') {
        const modal = document.getElementById('shortcuts-modal');
        if (modal) modal.classList.toggle('show');
        return;
      }

      if (key >= '0' && key <= '9') {
        this.triggerButtonByData('value', key);
        this.handleButtonPress('number', key);
      } else if (key === '.') {
        this.triggerButtonByData('action', 'decimal');
        this.handleButtonPress('decimal', '.');
      } else if (key === '+') {
        this.triggerButtonByData('value', '+');
        this.handleButtonPress('operator', '+');
      } else if (key === '-') {
        this.triggerButtonByData('value', '-');
        this.handleButtonPress('operator', '-');
      } else if (key === '*') {
        this.triggerButtonByData('value', '×');
        this.handleButtonPress('operator', '×');
      } else if (key === '/') {
        e.preventDefault();
        this.triggerButtonByData('value', '÷');
        this.handleButtonPress('operator', '÷');
      } else if (key === '%') {
        this.triggerButtonByData('action', 'percent');
        this.handleButtonPress('percent', '%');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        this.triggerButtonByData('action', 'equals');
        this.handleButtonPress('equals', '=');
      } else if (key === 'Backspace') {
        this.triggerButtonByData('action', 'delete');
        this.handleButtonPress('delete', 'DEL');
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        this.triggerButtonByData('action', 'clear');
        this.handleButtonPress('clear', 'C');
      }
    });
  }

  /**
   * محاكاة تأثير الضغط على الأزرار عند الكتابة عبر لوحة المفاتيح
   */
  triggerButtonByData(attr, val) {
    const selector = `.btn[data-${attr}="${val}"]`;
    const btn = document.querySelector(selector);
    if (btn) {
      this.animateButton(btn);
    }
  }

  /**
   * إضافة حركة ضغط على الزر (Visual Scale Effect)
   */
  animateButton(btn) {
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 150);
  }

  /**
   * نسخ النتيجة إلى حافظة الجهاز Copy Result
   */
  async copyResult() {
    if (!this.currentInput || this.isError) return;

    try {
      await navigator.clipboard.writeText(this.currentInput);
      this.showToast('تم نسخ النتيجة إلى الحافظة! 📋');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = this.currentInput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('تم نسخ النتيجة! 📋');
    }
  }

  /**
   * إظهار رسالة التنويه السريعة Toast
   * @param {string} msg - الرسالة
   */
  showToast(msg) {
    let toast = document.getElementById('toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notification';
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  /**
   * التبديل لوضع ملء الشاشة Fullscreen Toggle
   */
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`تعذر التكبير لملء الشاشة: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
}

// تهيئة محرك الحاسبة وجعله متاحاً بشكل عالمي
document.addEventListener('DOMContentLoaded', () => {
  window.CalculatorApp = new Calculator();
});
