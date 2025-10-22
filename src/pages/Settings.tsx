import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Building, 
  Printer, 
  Bell, 
  Database, 
  Shield, 
  Palette,
  Save,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { saveTemplateConfig } from "@/utils/templateUtils";
// Import language context
import { useLanguage } from "@/contexts/LanguageContext";

interface SettingsProps {
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

export const Settings = ({ username, onBack, onLogout }: SettingsProps) => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState("general");
  
  // General settings
  const [businessName, setBusinessName] = useState("My Business");
  const [businessAddress, setBusinessAddress] = useState("123 Main St, City, Country");
  const [businessPhone, setBusinessPhone] = useState("+1234567890");
  const [currency, setCurrency] = useState("TZS");
  const [timezone, setTimezone] = useState("Africa/Dar_es_Salaam");
  
  // Receipt settings
  const [printReceipts, setPrintReceipts] = useState(true);
  const [receiptHeader, setReceiptHeader] = useState("Thank you for your business!");
  const [showLogo, setShowLogo] = useState(true);
  
  // Custom receipt template settings
  const [customTemplate, setCustomTemplate] = useState(false);
  const [templateHeader, setTemplateHeader] = useState("POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890");
  const [templateFooter, setTemplateFooter] = useState("Thank you for your business!\nItems sold are not returnable\nVisit us again soon");
  const [showBusinessInfo, setShowBusinessInfo] = useState(true);
  const [showTransactionDetails, setShowTransactionDetails] = useState(true);
  const [showItemDetails, setShowItemDetails] = useState(true);
  const [showTotals, setShowTotals] = useState(true);
  const [showPaymentInfo, setShowPaymentInfo] = useState(true);
  const [fontSize, setFontSize] = useState("12px");
  const [paperWidth, setPaperWidth] = useState("320px");
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [dailyReports, setDailyReports] = useState(true);
  
  // Security settings
  const [requirePassword, setRequirePassword] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  // Display settings
  const [darkMode, setDarkMode] = useState(false);
  const [displayFontSize, setDisplayFontSize] = useState("medium");
  
  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      // Load general settings
      const savedBusinessName = localStorage.getItem('businessName');
      if (savedBusinessName) setBusinessName(savedBusinessName);
      
      const savedBusinessAddress = localStorage.getItem('businessAddress');
      if (savedBusinessAddress) setBusinessAddress(savedBusinessAddress);
      
      const savedBusinessPhone = localStorage.getItem('businessPhone');
      if (savedBusinessPhone) setBusinessPhone(savedBusinessPhone);
      
      const savedCurrency = localStorage.getItem('currency');
      if (savedCurrency) setCurrency(savedCurrency);
      
      const savedTimezone = localStorage.getItem('timezone');
      if (savedTimezone) setTimezone(savedTimezone);
      
      // Load receipt settings
      const savedPrintReceipts = localStorage.getItem('printReceipts');
      if (savedPrintReceipts) setPrintReceipts(savedPrintReceipts === 'true');
      
      const savedReceiptHeader = localStorage.getItem('receiptHeader');
      if (savedReceiptHeader) setReceiptHeader(savedReceiptHeader);
      
      const savedShowLogo = localStorage.getItem('showLogo');
      if (savedShowLogo) setShowLogo(savedShowLogo === 'true');
      
      // Load template settings
      const savedCustomTemplate = localStorage.getItem('customTemplate');
      if (savedCustomTemplate) setCustomTemplate(savedCustomTemplate === 'true');
      
      const savedTemplateHeader = localStorage.getItem('templateHeader');
      if (savedTemplateHeader) setTemplateHeader(savedTemplateHeader);
      
      const savedTemplateFooter = localStorage.getItem('templateFooter');
      if (savedTemplateFooter) setTemplateFooter(savedTemplateFooter);
      
      const savedShowBusinessInfo = localStorage.getItem('showBusinessInfo');
      if (savedShowBusinessInfo) setShowBusinessInfo(savedShowBusinessInfo === 'true');
      
      const savedShowTransactionDetails = localStorage.getItem('showTransactionDetails');
      if (savedShowTransactionDetails) setShowTransactionDetails(savedShowTransactionDetails === 'true');
      
      const savedShowItemDetails = localStorage.getItem('showItemDetails');
      if (savedShowItemDetails) setShowItemDetails(savedShowItemDetails === 'true');
      
      const savedShowTotals = localStorage.getItem('showTotals');
      if (savedShowTotals) setShowTotals(savedShowTotals === 'true');
      
      const savedShowPaymentInfo = localStorage.getItem('showPaymentInfo');
      if (savedShowPaymentInfo) setShowPaymentInfo(savedShowPaymentInfo === 'true');
      
      const savedFontSize = localStorage.getItem('fontSize');
      if (savedFontSize) setFontSize(savedFontSize);
      
      const savedPaperWidth = localStorage.getItem('paperWidth');
      if (savedPaperWidth) setPaperWidth(savedPaperWidth);
      
      // Load notification settings
      const savedEmailNotifications = localStorage.getItem('emailNotifications');
      if (savedEmailNotifications) setEmailNotifications(savedEmailNotifications === 'true');
      
      const savedLowStockAlerts = localStorage.getItem('lowStockAlerts');
      if (savedLowStockAlerts) setLowStockAlerts(savedLowStockAlerts === 'true');
      
      const savedDailyReports = localStorage.getItem('dailyReports');
      if (savedDailyReports) setDailyReports(savedDailyReports === 'true');
      
      // Load security settings
      const savedRequirePassword = localStorage.getItem('requirePassword');
      if (savedRequirePassword) setRequirePassword(savedRequirePassword === 'true');
      
      const savedSessionTimeout = localStorage.getItem('sessionTimeout');
      if (savedSessionTimeout) setSessionTimeout(savedSessionTimeout);
      
      const savedTwoFactorAuth = localStorage.getItem('twoFactorAuth');
      if (savedTwoFactorAuth) setTwoFactorAuth(savedTwoFactorAuth === 'true');
      
      // Load display settings
      const savedDarkMode = localStorage.getItem('darkMode');
      if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
      
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) setLanguage(savedLanguage);
      
      const savedDisplayFontSize = localStorage.getItem('displayFontSize');
      if (savedDisplayFontSize) setDisplayFontSize(savedDisplayFontSize);
    };
    
    loadSettings();
  }, [setLanguage]);
  
  const handleSave = () => {
    // Save general settings
    localStorage.setItem('businessName', businessName);
    localStorage.setItem('businessAddress', businessAddress);
    localStorage.setItem('businessPhone', businessPhone);
    localStorage.setItem('currency', currency);
    localStorage.setItem('timezone', timezone);
    
    // Save receipt settings
    localStorage.setItem('printReceipts', printReceipts.toString());
    localStorage.setItem('receiptHeader', receiptHeader);
    localStorage.setItem('showLogo', showLogo.toString());
    
    // Save template settings
    localStorage.setItem('customTemplate', customTemplate.toString());
    localStorage.setItem('templateHeader', templateHeader);
    localStorage.setItem('templateFooter', templateFooter);
    localStorage.setItem('showBusinessInfo', showBusinessInfo.toString());
    localStorage.setItem('showTransactionDetails', showTransactionDetails.toString());
    localStorage.setItem('showItemDetails', showItemDetails.toString());
    localStorage.setItem('showTotals', showTotals.toString());
    localStorage.setItem('showPaymentInfo', showPaymentInfo.toString());
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('paperWidth', paperWidth);
    
    // Save template config for printing utilities
    saveTemplateConfig({
      customTemplate,
      templateHeader,
      templateFooter,
      showBusinessInfo,
      showTransactionDetails,
      showItemDetails,
      showTotals,
      showPaymentInfo,
      fontSize,
      paperWidth
    });
    
    // Save notification settings
    localStorage.setItem('emailNotifications', emailNotifications.toString());
    localStorage.setItem('lowStockAlerts', lowStockAlerts.toString());
    localStorage.setItem('dailyReports', dailyReports.toString());
    
    // Save security settings
    localStorage.setItem('requirePassword', requirePassword.toString());
    localStorage.setItem('sessionTimeout', sessionTimeout);
    localStorage.setItem('twoFactorAuth', twoFactorAuth.toString());
    
    // Save display settings
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('language', language);
    localStorage.setItem('displayFontSize', displayFontSize);
    
    toast({
      title: t("settingsSaved"),
      description: t("settingsSavedDescription"),
    });
  };
  
  const handleReset = () => {
    // Reset to default values
    setBusinessName("My Business");
    setBusinessAddress("123 Main St, City, Country");
    setBusinessPhone("+1234567890");
    setCurrency("TZS");
    setTimezone("Africa/Dar_es_Salaam");
    setPrintReceipts(true);
    setReceiptHeader("Thank you for your business!");
    setShowLogo(true);
    
    // Reset template settings
    setCustomTemplate(false);
    setTemplateHeader("POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890");
    setTemplateFooter("Thank you for your business!\nItems sold are not returnable\nVisit us again soon");
    setShowBusinessInfo(true);
    setShowTransactionDetails(true);
    setShowItemDetails(true);
    setShowTotals(true);
    setShowPaymentInfo(true);
    setFontSize("12px");
    setPaperWidth("320px");
    
    setEmailNotifications(true);
    setLowStockAlerts(true);
    setDailyReports(true);
    setRequirePassword(true);
    setSessionTimeout("30");
    setTwoFactorAuth(false);
    setDarkMode(false);
    setLanguage("en");
    setDisplayFontSize("medium");
    
    toast({
      title: t("settingsReset"),
      description: t("settingsResetDescription"),
    });
  };
  
  const tabs = [
    { id: "general", label: t("general"), icon: Building },
    { id: "receipt", label: t("receipt"), icon: Printer },
    { id: "notifications", label: t("notifications"), icon: Bell },
    { id: "security", label: t("security"), icon: Shield },
    { id: "display", label: t("display"), icon: Palette },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title={t("systemSettings")} 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">{t("systemSettings")}</h2>
          <p className="text-muted-foreground">
            {t("configureSystemPreferences")}
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>{t("settingsCategories")}</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`flex items-center w-full px-3 py-2 rounded-md text-left ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Settings Content */}
          <div className="lg:w-3/4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {tabs.find(tab => tab.id === activeTab)?.label} {t("settings")}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      {t("reset")}
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      {t("saveChanges")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "general" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="business-name">{t("businessName")}</Label>
                        <Input
                          id="business-name"
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="business-phone">{t("businessPhone")}</Label>
                        <Input
                          id="business-phone"
                          value={businessPhone}
                          onChange={(e) => setBusinessPhone(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business-address">{t("businessAddress")}</Label>
                      <Input
                        id="business-address"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currency">{t("currency")}</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TZS">TZS (Tanzanian Shilling)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">{t("timezone")}</Label>
                        <Select value={timezone} onValueChange={setTimezone}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Dar_es_Salaam">Dar es Salaam (GMT+3)</SelectItem>
                            <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "receipt" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("printReceipts")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("printReceiptsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={printReceipts}
                        onCheckedChange={setPrintReceipts}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receipt-header">{t("receiptHeader")}</Label>
                      <Input
                        id="receipt-header"
                        value={receiptHeader}
                        onChange={(e) => setReceiptHeader(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("showLogo")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("showLogoDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={showLogo}
                        onCheckedChange={setShowLogo}
                      />
                    </div>
                    
                    {/* Custom Receipt Template Settings */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">{t("customReceiptTemplate")}</h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <Label>{t("enableCustomTemplate")}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t("enableCustomTemplateDescription")}
                          </p>
                        </div>
                        <Switch
                          checked={customTemplate}
                          onCheckedChange={setCustomTemplate}
                        />
                      </div>
                      
                      {customTemplate && (
                        <div className="space-y-4 pl-2 border-l-2 border-primary ml-2">
                          <div className="space-y-2">
                            <Label htmlFor="template-header">{t("receiptHeaderTemplate")}</Label>
                            <textarea
                              id="template-header"
                              value={templateHeader}
                              onChange={(e) => setTemplateHeader(e.target.value)}
                              className="w-full min-h-[80px] p-2 border rounded-md"
                              placeholder={t("enterReceiptHeader")}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="template-footer">{t("receiptFooter")}</Label>
                            <textarea
                              id="template-footer"
                              value={templateFooter}
                              onChange={(e) => setTemplateFooter(e.target.value)}
                              className="w-full min-h-[80px] p-2 border rounded-md"
                              placeholder={t("enterReceiptFooter")}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="font-size">{t("fontSize")}</Label>
                              <Select value={fontSize} onValueChange={setFontSize}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10px">10px ({t("small")})</SelectItem>
                                  <SelectItem value="12px">12px ({t("medium")})</SelectItem>
                                  <SelectItem value="14px">14px ({t("large")})</SelectItem>
                                  <SelectItem value="16px">16px ({t("extraLarge")})</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="paper-width">{t("paperWidth")}</Label>
                              <Select value={paperWidth} onValueChange={setPaperWidth}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="280px">280px ({t("narrow")})</SelectItem>
                                  <SelectItem value="320px">320px ({t("standard")})</SelectItem>
                                  <SelectItem value="360px">360px ({t("wide")})</SelectItem>
                                  <SelectItem value="400px">400px ({t("extraWide")})</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showBusinessInfo")}</Label>
                              </div>
                              <Switch
                                checked={showBusinessInfo}
                                onCheckedChange={setShowBusinessInfo}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showTransactionDetails")}</Label>
                              </div>
                              <Switch
                                checked={showTransactionDetails}
                                onCheckedChange={setShowTransactionDetails}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showItemDetails")}</Label>
                              </div>
                              <Switch
                                checked={showItemDetails}
                                onCheckedChange={setShowItemDetails}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showTotals")}</Label>
                              </div>
                              <Switch
                                checked={showTotals}
                                onCheckedChange={setShowTotals}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div>
                                <Label>{t("showPaymentInfo")}</Label>
                              </div>
                              <Switch
                                checked={showPaymentInfo}
                                onCheckedChange={setShowPaymentInfo}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === "notifications" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("emailNotifications")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("emailNotificationsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("lowStockAlerts")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("lowStockAlertsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={lowStockAlerts}
                        onCheckedChange={setLowStockAlerts}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("dailyReports")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("dailyReportsDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={dailyReports}
                        onCheckedChange={setDailyReports}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === "security" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("requirePassword")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("requirePasswordDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={requirePassword}
                        onCheckedChange={setRequirePassword}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">{t("sessionTimeout")}</Label>
                      <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 {t("minutes")}</SelectItem>
                          <SelectItem value="15">15 {t("minutes")}</SelectItem>
                          <SelectItem value="30">30 {t("minutes")}</SelectItem>
                          <SelectItem value="60">60 {t("minutes")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("twoFactorAuth")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("twoFactorAuthDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={twoFactorAuth}
                        onCheckedChange={setTwoFactorAuth}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === "display" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t("darkMode")}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t("darkModeDescription")}
                        </p>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">{t("language")}</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="sw">Swahili</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="display-font-size">{t("displayFontSize")}</Label>
                      <Select value={displayFontSize} onValueChange={setDisplayFontSize}>
                        <SelectTrigger id="display-font-size">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">{t("small")}</SelectItem>
                          <SelectItem value="medium">{t("medium")}</SelectItem>
                          <SelectItem value="large">{t("large")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};