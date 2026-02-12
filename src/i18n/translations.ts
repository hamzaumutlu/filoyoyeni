// ============================================
// Translation Dictionaries — TR / EN
// ============================================

export type Language = 'tr' | 'en';

export interface TranslationDictionary {
    [key: string]: string;
}

const tr: TranslationDictionary = {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.companies': 'Firmalar',
    'nav.personnel': 'Personel',
    'nav.methods': 'Yöntemler',
    'nav.dataEntry': 'Veri Girişi',
    'nav.payments': 'Ödemeler',
    'nav.users': 'Kullanıcılar',
    'nav.settings': 'Ayarlar',
    'nav.logout': 'Çıkış',

    // Header
    'header.search': 'Ara...',
    'header.admin': 'Admin',

    // Auth
    'auth.superAdmin': 'Süper Admin',
    'auth.admin': 'Admin',
    'auth.user': 'Kullanıcı',

    // Settings Page
    'settings.title': 'Ayarlar',
    'settings.subtitle': 'Sistem ve firma ayarlarını yönetin',
    'settings.save': 'Kaydet',
    'settings.saving': 'Kaydediliyor...',
    'settings.saved': 'Kaydedildi!',
    'settings.autoSaving': 'Otomatik kaydediliyor',
    'settings.cancel': 'İptal',
    'settings.update': 'Güncelle',

    // Settings Tabs
    'settings.tab.company': 'Firma Bilgileri',
    'settings.tab.system': 'Sistem Ayarları',
    'settings.tab.notifications': 'Bildirimler',
    'settings.tab.security': 'Güvenlik',

    // Company Info
    'company.add': 'Firma Ekle',
    'company.edit': 'Firma Düzenle',
    'company.addNew': 'Yeni Firma Ekle',
    'company.editDescription': 'Firma bilgilerini güncelleyin',
    'company.addDescription': 'Yeni bir firma kaydı oluşturun',
    'company.savedCompanies': 'Kayıtlı Firmalar',
    'company.totalRecords': 'Toplam {count} firma kaydı bulunuyor',
    'company.noRecords': 'Henüz firma kaydı eklenmemiş',
    'company.noRecordsHint': 'Yukarıdaki "Firma Ekle" butonuna tıklayarak yeni firma ekleyebilirsiniz',
    'company.name': 'Firma Adı',
    'company.namePlaceholder': 'Firma adınız',
    'company.nameRequired': 'Firma adı zorunludur!',
    'company.email': 'Yetkili E-posta',
    'company.emailPlaceholder': 'yetkili@firma.com',
    'company.phone': 'Telefon',
    'company.phonePlaceholder': '+90 555 123 4567',
    'company.website': 'Website',
    'company.websitePlaceholder': 'https://firma.com',
    'company.address': 'Adres',
    'company.addressPlaceholder': 'Firma adresi',
    'company.taxId': 'Vergi No / TCKN',
    'company.taxIdPlaceholder': '1234567890',
    'company.taxIdLabel': 'Vergi No',
    'company.deleteConfirm': 'Bu firmayı silmek istediğinize emin misiniz?',
    'company.deleteFailed': 'Silme işlemi başarısız oldu',
    'company.saveFailed': 'Kayıt başarısız',
    'company.sectionTitle': 'Firma Bilgileri',
    'company.sectionDescription': 'Firmanızın genel bilgilerini güncelleyin',

    // System Settings
    'system.title': 'Sistem Ayarları',
    'system.description': 'Genel sistem tercihlerini yapılandırın',
    'system.currency': 'Para Birimi',
    'system.currency.try': '₺ Türk Lirası (TRY)',
    'system.currency.usd': '$ Amerikan Doları (USD)',
    'system.currency.eur': '€ Euro (EUR)',
    'system.currency.gbp': '£ İngiliz Sterlini (GBP)',
    'system.timezone': 'Saat Dilimi',
    'system.timezone.istanbul': 'İstanbul (UTC+3)',
    'system.timezone.london': 'Londra (UTC+0)',
    'system.timezone.newyork': 'New York (UTC-5)',
    'system.timezone.dubai': 'Dubai (UTC+4)',
    'system.dateFormat': 'Tarih Formatı',
    'system.language': 'Dil',
    'system.autoBackup': 'Otomatik Yedekleme',
    'system.autoBackupDesc': 'Verileriniz otomatik olarak yedeklensin',
    'system.darkMode': 'Koyu Tema',
    'system.darkModeDesc': 'Karanlık mod arayüzü kullanılsın',

    // Notifications
    'notifications.title': 'Bildirim Ayarları',
    'notifications.description': 'Hangi bildirimlerden haberdar olmak istediğinizi seçin',
    'notifications.emailAddress': 'Bildirim E-posta Adresi',
    'notifications.emailAddressPlaceholder': 'ornek@gmail.com',
    'notifications.emailAddressDesc': 'Bildirimlerin gönderileceği e-posta adresini girin',
    'notifications.email': 'E-posta Bildirimleri',
    'notifications.emailDesc': 'Genel e-posta bildirimlerini etkinleştirin',
    'notifications.advance': 'Avans Uyarıları',
    'notifications.advanceDesc': 'Personel avans talep ettiğinde bildirim alın',
    'notifications.payment': 'Ödeme Hatırlatıcıları',
    'notifications.paymentDesc': 'Yaklaşan veya geciken ödemeler için hatırlatma',
    'notifications.monthly': 'Aylık Raporlar',
    'notifications.monthlyDesc': 'Her ay özet raporu e-posta ile gönderilsin',
    'notifications.lowBalance': 'Düşük Bakiye Uyarısı',
    'notifications.lowBalanceDesc': 'Kasa bakiyesi düşükken uyarı alın',
    'notifications.personnel': 'Personel Değişiklikleri',
    'notifications.personnelDesc': 'Personel ekleme/çıkarma işlemlerinde bildirim',

    // Security
    'security.title': 'Güvenlik',
    'security.description': 'Şifrenizi değiştirin ve hesabınızı koruyun',
    'security.currentPassword': 'Mevcut Şifre',
    'security.currentPasswordPlaceholder': 'Mevcut şifreniz',
    'security.newPassword': 'Yeni Şifre',
    'security.newPasswordPlaceholder': 'En az 6 karakter',
    'security.confirmPassword': 'Yeni Şifre (Tekrar)',
    'security.confirmPasswordPlaceholder': 'Yeni şifreyi tekrar girin',
    'security.passwordMismatch': 'Şifreler eşleşmiyor',
    'security.changePassword': 'Şifreyi Değiştir',
    'security.sessionInfo': 'Oturum Bilgisi',
    'security.lastLogin': 'Son Giriş',
    'security.ipAddress': 'IP Adresi',
    'security.browser': 'Tarayıcı',
    'security.passwordsMismatchAlert': 'Yeni şifreler eşleşmiyor!',
    'security.passwordMinLength': 'Şifre en az 6 karakter olmalıdır!',
    'security.currentPasswordWrong': 'Mevcut şifre yanlış!',
    'security.passwordChanged': 'Şifre başarıyla değiştirildi!',

    // Common
    'common.edit': 'Düzenle',
    'common.delete': 'Sil',
    'common.unknownError': 'Bilinmeyen hata',
};

const en: TranslationDictionary = {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.companies': 'Companies',
    'nav.personnel': 'Personnel',
    'nav.methods': 'Methods',
    'nav.dataEntry': 'Data Entry',
    'nav.payments': 'Payments',
    'nav.users': 'Users',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Header
    'header.search': 'Search...',
    'header.admin': 'Admin',

    // Auth
    'auth.superAdmin': 'Super Admin',
    'auth.admin': 'Admin',
    'auth.user': 'User',

    // Settings Page
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage system and company settings',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',
    'settings.saved': 'Saved!',
    'settings.autoSaving': 'Auto-saving',
    'settings.cancel': 'Cancel',
    'settings.update': 'Update',

    // Settings Tabs
    'settings.tab.company': 'Company Info',
    'settings.tab.system': 'System Settings',
    'settings.tab.notifications': 'Notifications',
    'settings.tab.security': 'Security',

    // Company Info
    'company.add': 'Add Company',
    'company.edit': 'Edit Company',
    'company.addNew': 'Add New Company',
    'company.editDescription': 'Update company information',
    'company.addDescription': 'Create a new company record',
    'company.savedCompanies': 'Saved Companies',
    'company.totalRecords': 'Total {count} company records found',
    'company.noRecords': 'No company records yet',
    'company.noRecordsHint': 'Click the "Add Company" button above to add a new company',
    'company.name': 'Company Name',
    'company.namePlaceholder': 'Your company name',
    'company.nameRequired': 'Company name is required!',
    'company.email': 'Authorized Email',
    'company.emailPlaceholder': 'authorized@company.com',
    'company.phone': 'Phone',
    'company.phonePlaceholder': '+1 555 123 4567',
    'company.website': 'Website',
    'company.websitePlaceholder': 'https://company.com',
    'company.address': 'Address',
    'company.addressPlaceholder': 'Company address',
    'company.taxId': 'Tax ID',
    'company.taxIdPlaceholder': '1234567890',
    'company.taxIdLabel': 'Tax ID',
    'company.deleteConfirm': 'Are you sure you want to delete this company?',
    'company.deleteFailed': 'Delete operation failed',
    'company.saveFailed': 'Save failed',
    'company.sectionTitle': 'Company Info',
    'company.sectionDescription': 'Update your company information',

    // System Settings
    'system.title': 'System Settings',
    'system.description': 'Configure general system preferences',
    'system.currency': 'Currency',
    'system.currency.try': '₺ Turkish Lira (TRY)',
    'system.currency.usd': '$ US Dollar (USD)',
    'system.currency.eur': '€ Euro (EUR)',
    'system.currency.gbp': '£ British Pound (GBP)',
    'system.timezone': 'Timezone',
    'system.timezone.istanbul': 'Istanbul (UTC+3)',
    'system.timezone.london': 'London (UTC+0)',
    'system.timezone.newyork': 'New York (UTC-5)',
    'system.timezone.dubai': 'Dubai (UTC+4)',
    'system.dateFormat': 'Date Format',
    'system.language': 'Language',
    'system.autoBackup': 'Auto Backup',
    'system.autoBackupDesc': 'Automatically backup your data',
    'system.darkMode': 'Dark Mode',
    'system.darkModeDesc': 'Use dark mode interface',

    // Notifications
    'notifications.title': 'Notification Settings',
    'notifications.description': 'Choose which notifications you want to receive',
    'notifications.emailAddress': 'Notification Email Address',
    'notifications.emailAddressPlaceholder': 'example@gmail.com',
    'notifications.emailAddressDesc': 'Enter the email address where notifications will be sent',
    'notifications.email': 'Email Notifications',
    'notifications.emailDesc': 'Enable general email notifications',
    'notifications.advance': 'Advance Alerts',
    'notifications.advanceDesc': 'Get notified when personnel request advances',
    'notifications.payment': 'Payment Reminders',
    'notifications.paymentDesc': 'Reminders for upcoming or overdue payments',
    'notifications.monthly': 'Monthly Reports',
    'notifications.monthlyDesc': 'Receive monthly summary reports via email',
    'notifications.lowBalance': 'Low Balance Alert',
    'notifications.lowBalanceDesc': 'Get alerted when cash balance is low',
    'notifications.personnel': 'Personnel Changes',
    'notifications.personnelDesc': 'Notifications for personnel additions/removals',

    // Security
    'security.title': 'Security',
    'security.description': 'Change your password and protect your account',
    'security.currentPassword': 'Current Password',
    'security.currentPasswordPlaceholder': 'Your current password',
    'security.newPassword': 'New Password',
    'security.newPasswordPlaceholder': 'At least 6 characters',
    'security.confirmPassword': 'Confirm New Password',
    'security.confirmPasswordPlaceholder': 'Re-enter your new password',
    'security.passwordMismatch': 'Passwords do not match',
    'security.changePassword': 'Change Password',
    'security.sessionInfo': 'Session Info',
    'security.lastLogin': 'Last Login',
    'security.ipAddress': 'IP Address',
    'security.browser': 'Browser',
    'security.passwordsMismatchAlert': 'New passwords do not match!',
    'security.passwordMinLength': 'Password must be at least 6 characters!',
    'security.currentPasswordWrong': 'Current password is incorrect!',
    'security.passwordChanged': 'Password changed successfully!',

    // Common
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.unknownError': 'Unknown error',
};

export const translations: Record<Language, TranslationDictionary> = { tr, en };
