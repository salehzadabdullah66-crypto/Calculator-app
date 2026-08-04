/**
 * ==========================================================================
 * تطبيق الآلة الحاسبة الذكية - وحدة إدارة الثيم (Theme Manager Module)
 * ==========================================================================
 * ملف مسئول عن التحكم في المظهر (الوضع الداكن Dark Mode / الوضع الفاتح Light Mode)
 * وحفظ تفضيل المستخدم في التخزين المحلي LocalStorage.
 */

// كائن إدارة الثيم
const ThemeManager = {
  // المفتاح المستخدم للتخزين المحلي
  STORAGE_KEY: 'smart_calc_theme',

  /**
   * تهيئة الثيم عند تحميل التطبيق
   */
  init() {
    // قراءة الثيم المحفوظ أو اعتماد الوضع الداكن كافتراضي
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) || 'dark';
    this.setTheme(savedTheme);
    this.bindEvents();
  },

  /**
   * تطبيق الثيم المحدد على مستند HTML وتحديث أيقونة الزر
   * @param {string} themeName - اسم الثيم ('dark' أو 'light')
   */
  setTheme(themeName) {
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(this.STORAGE_KEY, themeName);
    this.updateIcon(themeName);
  },

  /**
   * التبديل بين الوضع الداكن والوضع الفاتح
   */
  toggle() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  },

  /**
   * تحديث شكل أيقونة التبديل (شمس/قمر)
   * @param {string} themeName - اسم الثيم الحالية
   */
  updateIcon(themeName) {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (!themeBtn) return;

    if (themeName === 'light') {
      // أيقونة القمر للتحويل إلى الداكن
      themeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
      themeBtn.setAttribute('title', 'التحويل إلى الوضع الداكن');
    } else {
      // أيقونة الشمس للتحويل إلى الفاتح
      themeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
      themeBtn.setAttribute('title', 'التحويل إلى الوضع الفاتح');
    }
  },

  /**
   * ربط الأحداث مع الأزرار
   */
  bindEvents() {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggle());
    }
  }
};

// تشغيل التهيئة بمجرد تجهيز شجرة DOM
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
});
