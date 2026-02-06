import { Product, Sale, Purchase, User, Role, Translation } from './types';

export const LOGO_URL = "https://www.inteko.az/static/media/logo.d9f40db4e21ba0994c92.png";

export const PRODUCT_GROUPS = ['Electronics', 'Furniture', 'Clothing', 'Accessories'];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Office Chair', group: 'Furniture', stock: 50, price: 120 },
  { id: '2', name: 'Gaming Laptop', group: 'Electronics', stock: 4, price: 1500 },
  { id: '3', name: 'Cotton T-Shirt', group: 'Clothing', stock: 100, price: 20 },
  { id: '4', name: 'Wireless Mouse', group: 'Accessories', stock: 2, price: 25 },
  { id: '5', name: 'Desk Lamp', group: 'Furniture', stock: 12, price: 45 },
  { id: '6', name: 'Smartphone', group: 'Electronics', stock: 3, price: 800 },
  { id: '7', name: 'Jeans', group: 'Clothing', stock: 8, price: 50 },
  { id: '8', name: 'Headphones', group: 'Electronics', stock: 15, price: 100 },
  { id: '9', name: 'Notebook', group: 'Accessories', stock: 120, price: 5 },
  { id: '10', name: 'Monitor', group: 'Electronics', stock: 1, price: 300 },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

export const MOCK_SALES: Sale[] = [
  { id: '101', date: today, productId: '2', quantity: 1, total: 1500, paymentMethod: 'card' },
  { id: '102', date: today, productId: '3', quantity: 2, total: 40, paymentMethod: 'cash' },
  { id: '103', date: today, productId: '4', quantity: 1, total: 25, paymentMethod: 'cash' },
  { id: '104', date: yesterday, productId: '1', quantity: 2, total: 240, paymentMethod: 'card' },
  { id: '105', date: '2023-10-01', productId: '6', quantity: 1, total: 800, paymentMethod: 'card' },
  { id: '106', date: today, productId: '10', quantity: 1, total: 300, paymentMethod: 'card' },
];

export const MOCK_PURCHASES: Purchase[] = [
  { id: '201', date: today, productId: '3', quantity: 50, total: 500 },
  { id: '202', date: yesterday, productId: '2', quantity: 5, total: 5000 },
];

export const DEFAULT_ROLES: Role[] = [
  { 
    name: 'Administrator', 
    permissions: ['dashboard', 'sales', 'purchases', 'profit', 'payments', 'sale_refund', 'stock', 'lowstock', 'admin', 'admin_users', 'admin_roles', 'admin_notifications'] 
  },
  { 
    name: 'Manager', 
    permissions: ['dashboard', 'sales', 'purchases', 'profit', 'payments', 'sale_refund', 'stock'] 
  },
  {
    name: 'Cashier',
    permissions: ['dashboard', 'sales', 'payments', 'sale_refund']
  }
];

export const DEFAULT_ADMIN: User = {
  id: 'admin',
  username: 'admin',
  voen: '1234567890',
  role: 'Administrator',
};

export const TRANSLATIONS: Translation = {
  login_title: { az: 'Giriş', ru: 'Вход', tr: 'Giriş', en: 'Login' },
  login_subtitle: { az: 'Hesabınıza daxil olun', ru: 'Войдите в свой аккаунт', tr: 'Hesabınıza giriş yapın', en: 'Sign in to your account' },
  voen: { az: 'VÖEN', ru: 'VOEN', tr: 'VOEN', en: 'VOEN' },
  username: { az: 'İstifadəçi adı', ru: 'Имя пользователя', tr: 'Kullanıcı Adı', en: 'Username' },
  voen_username: { az: 'VÖEN İstifadəçi adı', ru: 'VOEN Имя пользователя', tr: 'VOEN Kullanıcı Adı', en: 'Voen Username' },
  password: { az: 'Şifrə', ru: 'Пароль', tr: 'Şifre', en: 'Password' },
  login_button: { az: 'Daxil ol', ru: 'Войти', tr: 'Giriş Yap', en: 'Log In' },
  dashboard: { az: 'İdarə Paneli', ru: 'Панель', tr: 'Panel', en: 'Dashboard' },
  sales_report: { az: 'Satış Hesabatı', ru: 'Отчет о продажах', tr: 'Satış Raporu', en: 'Sales Report' },
  purchase_report: { az: 'Alış Hesabatı', ru: 'Отчет о закупках', tr: 'Alış Raporu', en: 'Purchase Report' },
  profit_report: { az: 'Mənfəət Hesabatı', ru: 'Отчет о прибыли', tr: 'Kâr Raporu', en: 'Profit Report' },
  payment_report: { az: 'Ödəniş Hesabatı', ru: 'Отчет о платежах', tr: 'Ödeme Raporu', en: 'Payment Report' },
  sale_refund_report: { az: 'Satış Geri Qaytarma', ru: 'Возврат продаж', tr: 'Satış İade Raporu', en: 'Sale Refund Report' },
  stock_report: { az: 'Anbar Hesabatı', ru: 'Отчет о запасах', tr: 'Stok Raporu', en: 'Stock Report' },
  low_stock: { az: 'Azalan Məhsullar', ru: 'Мало запасов', tr: 'Azalan Stok', en: 'Low Stock' },
  admin_users: { az: 'İstifadəçilər', ru: 'Пользователи', tr: 'Kullanıcılar', en: 'Users' },
  admin_roles: { az: 'Rollar', ru: 'Роли', tr: 'Roller', en: 'Roles' },
  admin_notifications: { az: 'Bildirişlər', ru: 'Уведомления', tr: 'Bildirimler', en: 'Notifications' },
  logout: { az: 'Çıxış', ru: 'Выйти', tr: 'Çıkış', en: 'Logout' },
  daily_sales: { az: 'Günlük Satış', ru: 'Ежедневные продажи', tr: 'Günlük Satış', en: 'Daily Sales' },
  monthly_sales: { az: 'Aylıq Satış', ru: 'Ежемесячные продажи', tr: 'Aylık Satış', en: 'Monthly Sales' },
  cash: { az: 'Nağd', ru: 'Наличные', tr: 'Nakit', en: 'Cash' },
  card: { az: 'Kart', ru: 'Карта', tr: 'Kart', en: 'Card' },
  bank: { az: 'Bank', ru: 'Банк', tr: 'Banka', en: 'Bank' },
  credit: { az: 'Nisyə', ru: 'Кредит', tr: 'Veresiye', en: 'Credit' },
  nisye: { az: 'Nisyə', ru: 'Кредит', tr: 'Veresiye', en: 'Credit' },
  top_products: { az: 'Ən Yaxşı 5 Məhsul', ru: 'Топ 5 Продуктов', tr: 'En İyi 5 Ürün', en: 'Top 5 Products' },
  worst_products: { az: 'Ən Pis 5 Məhsul', ru: 'Худшие 5 Продуктов', tr: 'En Kötü 5 Ürün', en: 'Worst 5 Products' },
  decreasing_stock: { az: 'Azalan Anbar', ru: 'Уменьшение запасов', tr: 'Azalan Stok', en: 'Decreasing Stock' },
  start_date: { az: 'Başlanğıc Tarixi', ru: 'Дата начала', tr: 'Başlangıç Tarihi', en: 'Start Date' },
  end_date: { az: 'Bitmə Tarixi', ru: 'Дата окончания', tr: 'Bitiş Tarihi', en: 'End Date' },
  product: { az: 'Məhsul', ru: 'Продукт', tr: 'Ürün', en: 'Product' },
  all_products: { az: 'Bütün Məhsullar', ru: 'Все продукты', tr: 'Tüm Ürünler', en: 'All Products' },
  group: { az: 'Qrup', ru: 'Группа', tr: 'Grup', en: 'Group' },
  all_groups: { az: 'Bütün Qruplar', ru: 'Все группы', tr: 'Tüm Gruplar', en: 'All Groups' },
  all_suppliers: { az: 'Bütün Təchizatçılar', ru: 'Все поставщики', tr: 'Tüm Tedarikçiler', en: 'All Suppliers' },
  quantity: { az: 'Mikdar', ru: 'Количество', tr: 'Miktar', en: 'Quantity' },
  total: { az: 'Cəm', ru: 'Всего', tr: 'Toplam', en: 'Total' },
  threshold: { az: 'Limit', ru: 'Предел', tr: 'Eşik', en: 'Threshold' },
  add_user: { az: 'İstifadəçi əlavə et', ru: 'Добавить пользователя', tr: 'Kullanıcı Ekle', en: 'Add User' },
  create_role: { az: 'Rol yarat', ru: 'Создать роль', tr: 'Rol Oluştur', en: 'Create Role' },
  role: { az: 'Rol', ru: 'Роль', tr: 'Rol', en: 'Role' },
  role_name: { az: 'Rol adı', ru: 'Имя роли', tr: 'Rol Adı', en: 'Role Name' },
  permissions: { az: 'İcazələr', ru: 'Разрешения', tr: 'İzinler', en: 'Permissions' },
  save: { az: 'Yadda saxla', ru: 'Сохранить', tr: 'Kaydet', en: 'Save' },
  error_login: { az: 'Məlumatlar yanlışdır', ru: 'Неверные данные', tr: 'Bilgiler yanlış', en: 'Invalid credentials' },
  send_notification: { az: 'Bildiriş göndər', ru: 'Отправить уведомление', tr: 'Bildirim Gönder', en: 'Send Notification' },
  message: { az: 'Mesaj', ru: 'Сообщение', tr: 'Mesaj', en: 'Message' },
  notifications: { az: 'Bildirişlər', ru: 'Уведомления', tr: 'Bildirimler', en: 'Notifications' },
  no_notifications: { az: 'Bildiriş yoxdur', ru: 'Нет уведомлений', tr: 'Bildirim yok', en: 'No notifications' },
  light_mode: { az: 'Gündüz rejimi', ru: 'Светлый режим', tr: 'Gündüz Modu', en: 'Light Mode' },
  dark_mode: { az: 'Gecə rejimi', ru: 'Темный режим', tr: 'Gece Modu', en: 'Dark Mode' },
  login_hero_title: { az: 'Inteko Manager', ru: 'Inteko Manager', tr: 'Inteko Manager', en: 'Inteko Manager' },
  login_hero_subtitle: { 
    az: 'Müasir müəssisə səmərəliliyi və nəzarəti üçün qabaqcıl idarəetmə həlləri.', 
    ru: 'Передовые решения для эффективности и контроля современного предприятия.', 
    tr: 'Modern işletme verimliliği ve kontrolü için gelişmiş yönetim çözümleri.', 
    en: 'Advanced management solutions for modern enterprise efficiency and control.' 
  },
  corporate_tools: { az: 'Korporativ Alətlər', ru: 'Корпоративные инструменты', tr: 'Kurumsal Araçlar', en: 'Corporate Tools' },
  user_management: { az: 'İstifadəçi İdarəetməsi', ru: 'Управление пользователями', tr: 'Kullanıcı Yönetimi', en: 'User Management' },
  rights_reserved: { az: 'Bütün hüquqlar qorunur.', ru: 'Все права защищены.', tr: 'Tüm hakları saklıdır.', en: 'All rights reserved.' },
  target_audience: { az: 'Hədəf Kütləsi', ru: 'Целевая аудитория', tr: 'Hedef Kitle', en: 'Target Audience' },
  target_all: { az: 'Hamı', ru: 'Все', tr: 'Herkes', en: 'Everyone' },
  target_role: { az: 'Seçilmiş Rol', ru: 'Выбранная роль', tr: 'Seçili Rol', en: 'Selected Role' },
  target_users: { az: 'Seçilmiş İstifadəçilər', ru: 'Выбранные пользователи', tr: 'Seçili Kullanıcılar', en: 'Selected Users' },
  select_users: { az: 'İstifadəçiləri seçin', ru: 'Выберите пользователей', tr: 'Kullanıcıları Seçin', en: 'Select Users' },
  date: { az: 'Tarix', ru: 'Дата', tr: 'Tarih', en: 'Date' },
  saledate: { az: 'Satış tarifesi', ru: 'Дата продажи', tr: 'Satış Tarihi', en: 'Sale Date' },
  purchasedate: { az: 'Alış tarixi', ru: 'Дата покупки', tr: 'Alış Tarihi', en: 'Purchase Date' },
  method: { az: 'Metod', ru: 'Метод', tr: 'Yöntem', en: 'Method' },
  current_stock: { az: 'Cari Anbar', ru: 'Текущий запас', tr: 'Mevcut Stok', en: 'Current Stock' },
  unit_price: { az: 'Vahid Qiyməti', ru: 'Цена за единицу', tr: 'Birim Fiyatı', en: 'Unit Price' },
  items_left: { az: 'Qalan Məhsul', ru: 'Осталось', tr: 'Kalan Ürün', en: 'Items Left' },
  generated_date: { az: 'Yaradılma Tarixi', ru: 'Дата создания', tr: 'Oluşturulma Tarihi', en: 'Generated Date' },
  threshold_filter: { az: 'Limit Filteri', ru: 'Фильтр порога', tr: 'Eşik Filtresi', en: 'Threshold Filter' },
  stock_healthy: { az: 'Anbar Normaldır', ru: 'Запас в норме', tr: 'Stok Normal', en: 'Stock Healthy' },
  no_low_stock: { az: 'Limitdən aşağı məhsul yoxdur', ru: 'Нет товаров ниже порога', tr: 'Eşik altında ürün yok', en: 'No products below threshold' },
  existing_users: { az: 'Mövcud İstifadəçilər', ru: 'Существующие пользователи', tr: 'Mevcut Kullanıcılar', en: 'Existing Users' },
  user_added_success: { az: 'İstifadəçi uğurla əlavə edildi', ru: 'Пользователь успешно добавлен', tr: 'Kullanıcı başarıyla eklendi', en: 'User added successfully' },
  role_exists: { az: 'Rol artıq mövcuddur', ru: 'Роль уже существует', tr: 'Rol zaten mevcut', en: 'Role already exists' },
  role_created: { az: 'Rol yaradıldı', ru: 'Роль создана', tr: 'Rol oluşturuldu', en: 'Role created' },
  permissions_updated: { az: 'İcazələr yeniləndi', ru: 'Разрешения обновлены', tr: 'İzinler güncellendi', en: 'Permissions updated' },
  permissions_for: { az: 'İcazələr:', ru: 'Разрешения для:', tr: 'İzinler:', en: 'Permissions for:' },
  cancel: { az: 'Ləğv et', ru: 'Отмена', tr: 'İptal', en: 'Cancel' },
  update_permissions: { az: 'İcazələri yenilə', ru: 'Обновить разрешения', tr: 'İzinleri Güncelle', en: 'Update Permissions' },
  select_role_placeholder: { az: 'İcazələri redaktə etmək üçün rol seçin', ru: 'Выберите роль для редактирования', tr: 'İzinleri düzenlemek için bir rol seçin', en: 'Select a role to edit permissions' },
  notification_sent: { az: 'Bildiriş göndərildi!', ru: 'Уведомление отправлено!', tr: 'Bildirim gönderildi!', en: 'Notification Sent!' },
  select_role: { az: 'Rol seçin', ru: 'Выберите роль', tr: 'Rol Seçin', en: 'Select Role' },
  users_selected: { az: 'istifadəçi seçildi', ru: 'пользователей выбрано', tr: 'kullanıcı seçildi', en: 'users selected' },
  type_message_placeholder: { az: 'Mesajınızı bura yazın...', ru: 'Введите ваше сообщение здесь...', tr: 'Mesajınızı buraya yazın...', en: 'Type your message here...' },
  permissions_count: { az: 'icazə', ru: 'разрешений', tr: 'izin', en: 'permissions' },
  
  // Super Admin / System Admin Translations
  system_admin: { az: 'Sistem Admin', ru: 'Системный админ', tr: 'Sistem Yöneticisi', en: 'System Admin' },
  packages: { az: 'Paketlər', ru: 'Пакеты', tr: 'Paketler', en: 'Packages' },
  tenants: { az: 'Şirkətlər', ru: 'Компании', tr: 'Kiracılar', en: 'Tenants' },
  subscription_packages: { az: 'Abunə Paketləri', ru: 'Пакеты подписки', tr: 'Abonelik Paketleri', en: 'Subscription Packages' },
  new_package: { az: 'Yeni Paket', ru: 'Новый пакет', tr: 'Yeni Paket', en: 'New Package' },
  package_name: { az: 'Paket Adı', ru: 'Имя пакета', tr: 'Paket Adı', en: 'Package Name' },
  max_users: { az: 'Maks. İstifadəçi', ru: 'Макс. польз.', tr: 'Maks. Kullanıcı', en: 'Max Users' },
  price: { az: 'Qiymət', ru: 'Цена', tr: 'Fiyat', en: 'Price' },
  user_limit: { az: 'İstifadəçi Limiti', ru: 'Лимит пользователей', tr: 'Kullanıcı Limiti', en: 'User Limit' },
  register_company: { az: 'Şirkət Qeydiyyatı', ru: 'Регистрация компании', tr: 'Şirket Kaydı', en: 'Register Company' },
  tenants_companies: { az: 'Şirkətlər (Kiracılar)', ru: 'Компании (Арендаторы)', tr: 'Şirketler', en: 'Tenants (Companies)' },
  company_name: { az: 'Şirkət Adı', ru: 'Название компании', tr: 'Şirket Adı', en: 'Company Name' },
  initial_admin: { az: 'İlkin Admin', ru: 'Начальный админ', tr: 'İlk Yönetici', en: 'Initial Admin' },
  assign_package: { az: 'Paket Təyin Et', ru: 'Назначить пакет', tr: 'Paket Ata', en: 'Assign Package' },
  status: { az: 'Status', ru: 'Статус', tr: 'Durum', en: 'Status' },
  joined: { az: 'Qoşuldu', ru: 'Присоединился', tr: 'Katıldı', en: 'Joined' },
  create_tenant: { az: 'Şirkət Yarat', ru: 'Создать компанию', tr: 'Şirket Oluştur', en: 'Create Tenant' },
  confirm_delete: { az: 'Əminsiniz?', ru: 'Вы уверены?', tr: 'Emin misiniz?', en: 'Are you sure?' },
  package_in_use: { az: 'Paket istifadədədir', ru: 'Пакет используется', tr: 'Paket kullanımda', en: 'Package in use' },
  tenant_created: { az: 'Şirkət yaradıldı', ru: 'Компания создана', tr: 'Şirket oluşturuldu', en: 'Tenant created' },
  error_creating_tenant: { az: 'Xəta', ru: 'Ошибка', tr: 'Hata', en: 'Error' },
  failed_create_package: { az: 'Paket yaradıla bilmədi', ru: 'Не удалось создать пакет', tr: 'Paket oluşturulamadı', en: 'Failed to create package' },
  unknown: { az: 'Naməlum', ru: 'Неизвестно', tr: 'Bilinmiyor', en: 'Unknown' },
  get_report: { az: 'Hesabat al', ru: 'Получить отчет', tr: 'Rapor Al', en: 'Get Report' },
  select_dates_first: { az: 'Zəhmət olmasa tarix aralığını seçin və "Hesabat al" düyməsini sıxın.', ru: 'Пожалуйста, выберите диапазон дат и нажмите «Получить отчет».', tr: 'Lütfen tarih aralığını seçin ve "Rapor Al" düğmesine tıklayın.', en: 'Please select a date range and click "Get Report".' },
  previous: { az: 'Əvvəlki', ru: 'Назад', tr: 'Önceki', en: 'Previous' },
  next: { az: 'Növbəti', ru: 'Вперед', tr: 'Sonraki', en: 'Next' },
  page: { az: 'Səhifə', ru: 'Страница', tr: 'Sayfa', en: 'Page' },
  of: { az: 'dan', ru: 'из', tr: '/', en: 'of' },
  no_records: { az: 'Qeyd tapılmadı', ru: 'Записей не найдено', tr: 'Kayıt bulunamadı', en: 'No records found' },
  edit: { az: 'Redaktə et', ru: 'Редактировать', tr: 'Düzenle', en: 'Edit' },
  update: { az: 'Yenilə', ru: 'Обновить', tr: 'Güncelle', en: 'Update' },
  actions: { az: 'Əməliyyatlar', ru: 'Действия', tr: 'İşlemler', en: 'Actions' },
  activate: { az: 'Aktivləşdir', ru: 'Активировать', tr: 'Etkinleştir', en: 'Activate' },
  deactivate: { az: 'Deaktiv et', ru: 'Деактивировать', tr: 'Devre Dışı Bırak', en: 'Deactivate' },
  active: { az: 'Aktiv', ru: 'Активный', tr: 'Aktif', en: 'Active' },
  inactive: { az: 'Deaktiv', ru: 'Неактивный', tr: 'Pasif', en: 'Inactive' },
  edit_package: { az: 'Paketi redaktə et', ru: 'Редактировать пакет', tr: 'Paketi Düzenle', en: 'Edit Package' },
  edit_tenant: { az: 'Şirkəti redaktə et', ru: 'Редактировать компанию', tr: 'Şirketi Düzenle', en: 'Edit Company' },
  update_success: { az: 'Uğurla yeniləndi', ru: 'Успешно обновлено', tr: 'Başarıyla güncellendi', en: 'Updated successfully' },
  edit_user: { az: 'İstifadəçini redaktə et', ru: 'Редактировать пользователя', tr: 'Kullanıcıyı Düzenle', en: 'Edit User' },
  leave_blank_password: { az: 'Şifrəni dəyişmək istəmirsinizsə boş buraxın', ru: 'Оставьте пустым, если не хотите менять пароль', tr: 'Şifreyi değiştirmek istemiyorsanız boş bırakın', en: 'Leave blank if you do not want to change the password' },
  account_inactive: { az: 'Hesabınız deaktiv edilib', ru: 'Ваш аккаунт деактивирован', tr: 'Hesabınız devre dışı bırakıldı', en: 'Your account is deactivated' },
  
  // New Customer Type Translations
  customer_type: { az: 'Müştəri Növü', ru: 'Тип клиента', tr: 'Müşteri Tipi', en: 'Customer Type' },
  normal_customer: { az: 'Normal Müştəri', ru: 'Обычный клиент', tr: 'Normal Müşteri', en: 'Normal Customer' },
  clinic_customer: { az: 'Klinika Müştərisi', ru: 'Клиника', tr: 'Klinik Müşterisi', en: 'Clinic Customer' },

  // Profile / Password
  change_password: { az: 'Şifrəni dəyiş', ru: 'Сменить пароль', tr: 'Şifreyi Değiştir', en: 'Change Password' },
  new_password: { az: 'Yeni Şifrə', ru: 'Новый пароль', tr: 'Yeni Şifre', en: 'New Password' },
  profile: { az: 'Profil', ru: 'Профиль', tr: 'Profil', en: 'Profile' },

  // Dynamic Table Keys
  tarix: { az: 'Tarix', ru: 'Дата', tr: 'Tarih', en: 'Date' },
  malinadi: { az: 'Məhsul adı', ru: 'Наименование товара', tr: 'Ürün Adı', en: 'Product Name' },
  productname: { az: 'Məhsul adı', ru: 'Наименование товара', tr: 'Ürün Adı', en: 'Product Name' },
  miqdar: { az: 'Mikdar', ru: 'Количество', tr: 'Miktar', en: 'Quantity' },
  mebleg: { az: 'Məbləğ', ru: 'Сумма', tr: 'Tutar', en: 'Amount' },
  totalamount: { az: 'Cəm ödəniş', ru: 'Всего', tr: 'Toplam', en: 'Total' },
  odenisnovu: { az: 'Ödəniş növü', ru: 'Тип оплаты', tr: 'Ödeme Türü', en: 'Payment Type' },
  paymenttype: { az: 'Ödəniş növü', ru: 'Тип оплаты', tr: 'Ödeme Türü', en: 'Payment Type' },
  qrup: { az: 'Qrup', ru: 'Группа', tr: 'Grup', en: 'Group' },
  categoryname: { az: 'Kateqoriya adı', ru: 'Категория', tr: 'Kategori', en: 'Category' },
  kod: { az: 'Kod', ru: 'Код', tr: 'Kod', en: 'Code' },
  anbar: { az: 'Anbar', ru: 'Склад', tr: 'Depo', en: 'Warehouse' },
  barcode: { az: 'Barkod', ru: 'Штрих-код', tr: 'Barkod', en: 'Barcode' },
  
  // New API Specific Keys
  cashiername: { az: 'İstifadəçi adı', ru: 'Кассир', tr: 'Kasiyer', en: 'Cashier' },
  suppliername: { az: 'Təchizatçı adı', ru: 'Поставщик', tr: 'Tedarikçi', en: 'Supplier' },
  customername: { az: 'Müştəri adı', ru: 'Клиент', tr: 'Müşteri', en: 'Customer' },
  doctorname: { az: 'Həkim adı', ru: 'Врач', tr: 'Doktor', en: 'Doctor' },
  unitname: { az: 'Vahidi', ru: 'Единица', tr: 'Birim', en: 'Unit' },
  saleprice: { az: 'Satış qiyməti', ru: 'Цена продажи', tr: 'Satış Fiyatı', en: 'Sale Price' },
  discountazn: { az: 'Endirim AZN', ru: 'Скидка (AZN)', tr: 'İndirim (AZN)', en: 'Discount (AZN)' },
  taxpercantages: { az: 'Vergi borcu', ru: 'НДС (%)', tr: 'KDV (%)', en: 'Tax (%)' },
  proccessno: { az: 'Əməliyyat №', ru: 'Номер операции', tr: 'İşlem No', en: 'Process No' },
  receiptno: { az: 'Çek №', ru: 'Чек №', tr: 'Fiş No', en: 'Receipt No' },

  // Purchase Specific
  invoiceno: { az: 'Faktura №', ru: 'Счет №', tr: 'Fatura No', en: 'Invoice No' },
  productcode: { az: 'Məhsul kodu', ru: 'Код продукта', tr: 'Ürün Kodu', en: 'Product Code' },
  purchaseprice: { az: 'Alış qiyməti', ru: 'Цена покупки', tr: 'Alış Fiyatı', en: 'Purchase Price' },
  discountpercentages: { az: 'Endirim %', ru: 'Скидка (%)', tr: 'İndirim (%)', en: 'Discount (%)' },
  discountpercantages: { az: 'Endirim %', ru: 'Скидка (%)', tr: 'İndirim (%)', en: 'Discount (%)' },
  discountpercentage: { az: 'Endirim %', ru: 'Скидка (%)', tr: 'İndirim (%)', en: 'Discount (%)' },
  discounttotalamount: { az: 'Endirim məbləği', ru: 'Общая скидка', tr: 'Toplam İndirim', en: 'Total Discount' },
  discountamount: { az: 'Endirim məbləği', ru: 'Сумма скидки', tr: 'İndirim Tutarı', en: 'Discount Amount' },
  payableamount: { az: 'Ödəniləcək məbləğ', ru: 'К оплате', tr: 'Ödenecek Tutar', en: 'Payable Amount' },

  // Profit Specific
  profitamount: { az: 'Mənfəət', ru: 'Прибыль', tr: 'Kâr', en: 'Profit' },
  salequantity: { az: 'Satış Sayı', ru: 'Кол-во продаж', tr: 'Satış Miktarı', en: 'Sale Quantity' },
  totalpurchaseamount: { az: 'Ümumi Alış', ru: 'Всего покупок', tr: 'Toplam Alış', en: 'Total Purchase' },
  totalsaleamount: { az: 'Ümumi Satış', ru: 'Всего продаж', tr: 'Toplam Satış', en: 'Total Sale' },
  
  // Stock Specific
  productbarcode: { az: 'Barkod', ru: 'Штрих-код', tr: 'Barkod', en: 'Barcode' },
  taxname: { az: 'ƏDV Adı', ru: 'Название НДС', tr: 'KDV Adı', en: 'Tax Name' },

  // Sale Refund Specific
  refundquantity: { az: 'Geri Qaytarma Sayı', ru: 'Количество возврата', tr: 'İade Miktarı', en: 'Refund Quantity' },
  refundamount: { az: 'Geri Qaytarma Məbləği', ru: 'Сумма возврата', tr: 'İade Tutarı', en: 'Refund Amount' },
  refundproccessno: { az: 'Geri Qaytarma №', ru: 'Возврат №', tr: 'İade İşlem No', en: 'Refund Process No' },
  saleproccessno: { az: 'Satış №', ru: 'Продажа №', tr: 'Satış İşlem No', en: 'Sale Process No' },
};