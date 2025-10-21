-- تحديث محتوى كروت RWA و Stable Coin بنفس التنسيق الأصلي

UPDATE public.roadmap_cards 
SET 
  page_content = E'<div class="max-w-4xl mx-auto">
  <div class="text-center mb-8">
    <p class="text-xl text-muted-foreground arabic-text">
      استثمر في الأصول الحقيقية المرموزة من مصر
    </p>
  </div>

  <!-- Asset Types Grid -->
  <div class="grid md:grid-cols-3 gap-6 mb-8">
    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2 arabic-text">🏠 العقارات</h3>
      <p class="text-muted-foreground text-sm arabic-text">استثمر في العقارات المصرية المرموزة</p>
    </div>

    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2 arabic-text">🏛️ التراث الثقافي</h3>
      <p class="text-muted-foreground text-sm arabic-text">أصول تراثية وثقافية مصرية مرموزة</p>
    </div>

    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2 arabic-text">🏢 التجاري</h3>
      <p class="text-muted-foreground text-sm arabic-text">المشاريع التجارية والصناعية</p>
    </div>
  </div>

  <!-- Main Content -->
  <div class="bg-card rounded-lg border p-6 mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold arabic-text">ما هو MSR-RWA؟</h2>
      <span class="px-3 py-1 text-sm border rounded-full">قريباً</span>
    </div>
    <div class="space-y-4">
      <p class="text-muted-foreground arabic-text">
        MSR-RWA يتيح لك الاستثمار في الأصول الحقيقية المصرية من خلال التكنولوجيا البلوك تشين، مما يوفر فرص استثمارية آمنة ومربحة.
      </p>

      <div class="grid md:grid-cols-2 gap-4 mt-6">
        <div class="bg-card/50 p-4 rounded-lg border">
          <h4 class="font-medium mb-2 arabic-text">كيف يعمل؟</h4>
          <p class="text-sm text-muted-foreground arabic-text">
            يتم ترميز الأصول الحقيقية المصرية وتقسيمها إلى وحدات قابلة للتداول، مما يتيح للمستثمرين شراء حصص صغيرة من أصول كبيرة.
          </p>
        </div>
        
        <div class="bg-card/50 p-4 rounded-lg border">
          <h4 class="font-medium mb-2 arabic-text">الأمان والثقة</h4>
          <p class="text-sm text-muted-foreground arabic-text">
            جميع الأصول محققة قانونياً ومدققة من قبل جهات خارجية مستقلة لضمان الشفافية والأمان.
          </p>
        </div>
      </div>

      <div class="text-center pt-6 space-y-4">
        <p class="text-muted-foreground arabic-text">
          المنصة قيد التطوير ويتم العمل على إطلاقها قريباً
        </p>
      </div>
    </div>
  </div>

  <!-- Coming Soon Section -->
  <div class="border-dashed border-2 border-primary/30 rounded-lg p-12 text-center">
    <div class="text-6xl mb-4">🏢</div>
    <h3 class="text-xl font-semibold mb-2 arabic-text">قريباً</h3>
    <p class="text-muted-foreground arabic-text">
      نعمل على إطلاق منصة MSR-RWA مع شركاء عقاريين وقانونيين موثوقين
    </p>
  </div>
</div>',
  page_content_en = E'<div class="max-w-4xl mx-auto">
  <div class="text-center mb-8">
    <p class="text-xl text-muted-foreground">
      Invest in tokenized Egyptian real-world assets
    </p>
  </div>

  <!-- Asset Types Grid -->
  <div class="grid md:grid-cols-3 gap-6 mb-8">
    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2">🏠 Real Estate</h3>
      <p class="text-muted-foreground text-sm">Invest in tokenized Egyptian real estate</p>
    </div>

    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2">🏛️ Cultural Heritage</h3>
      <p class="text-muted-foreground text-sm">Tokenized Egyptian cultural and heritage assets</p>
    </div>

    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2">🏢 Commercial</h3>
      <p class="text-muted-foreground text-sm">Commercial and industrial projects</p>
    </div>
  </div>

  <!-- Main Content -->
  <div class="bg-card rounded-lg border p-6 mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">What is MSR-RWA?</h2>
      <span class="px-3 py-1 text-sm border rounded-full">Coming Soon</span>
    </div>
    <div class="space-y-4">
      <p class="text-muted-foreground">
        MSR-RWA allows you to invest in real Egyptian assets through blockchain technology, providing safe and profitable investment opportunities.
      </p>

      <div class="grid md:grid-cols-2 gap-4 mt-6">
        <div class="bg-card/50 p-4 rounded-lg border">
          <h4 class="font-medium mb-2">How it Works?</h4>
          <p class="text-sm text-muted-foreground">
            Real Egyptian assets are tokenized and divided into tradable units, allowing investors to buy small shares of large assets.
          </p>
        </div>
        
        <div class="bg-card/50 p-4 rounded-lg border">
          <h4 class="font-medium mb-2">Security & Trust</h4>
          <p class="text-sm text-muted-foreground">
            All assets are legally verified and audited by independent third parties to ensure transparency and security.
          </p>
        </div>
      </div>

      <div class="text-center pt-6 space-y-4">
        <p class="text-muted-foreground">
          Platform is under development and will be launched soon
        </p>
      </div>
    </div>
  </div>

  <!-- Coming Soon Section -->
  <div class="border-dashed border-2 border-primary/30 rounded-lg p-12 text-center">
    <div class="text-6xl mb-4">🏢</div>
    <h3 class="text-xl font-semibold mb-2">Coming Soon</h3>
    <p class="text-muted-foreground">
      We are working on launching MSR-RWA platform with trusted real estate and legal partners
    </p>
  </div>
</div>',
  updated_at = now()
WHERE slug = 'rwa';

UPDATE public.roadmap_cards 
SET 
  page_content = E'<div class="max-w-4xl mx-auto">
  <div class="text-center mb-8">
    <p class="text-xl text-muted-foreground arabic-text">
      العملة المستقرة المدعومة بالأصول المصرية
    </p>
  </div>

  <!-- Features Grid -->
  <div class="grid md:grid-cols-2 gap-6 mb-8">
    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2 arabic-text">🛡️ الاستقرار والثبات</h3>
      <p class="text-muted-foreground arabic-text">
        عملة مستقرة مدعومة بالأصول الحقيقية في مصر لضمان الثبات والأمان
      </p>
    </div>

    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2 arabic-text">📈 النمو المستدام</h3>
      <p class="text-muted-foreground arabic-text">
        نموذج اقتصادي مبتكر يدعم النمو المستدام للاقتصاد المحلي
      </p>
    </div>
  </div>

  <!-- Main Content -->
  <div class="bg-card rounded-lg border p-6 mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold arabic-text">ما هو MSR Stable Coin؟</h2>
      <span class="px-3 py-1 text-sm border rounded-full">قريباً</span>
    </div>
    <div class="space-y-4">
      <p class="text-muted-foreground arabic-text">
        MSR Stable Coin هو عملة رقمية مستقرة مدعومة بالأصول الحقيقية في مصر، مصممة لتوفير الاستقرار والثقة في النظام المالي الرقمي.
      </p>
      
      <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
        <h3 class="font-semibold mb-3 arabic-text">الميزات الرئيسية:</h3>
        <ul class="space-y-2 text-sm text-muted-foreground arabic-text">
          <li>• مدعوم بأصول حقيقية في مصر</li>
          <li>• استقرار في القيمة مقابل الجنيه المصري</li>
          <li>• شفافية كاملة في الاحتياطيات</li>
          <li>• سهولة في التحويل والاستخدام</li>
          <li>• دعم للاقتصاد المحلي المصري</li>
        </ul>
      </div>

      <div class="text-center pt-6">
        <p class="text-muted-foreground arabic-text mb-4">
          قريباً: الورقة البيضاء والإطلاق الرسمي
        </p>
      </div>
    </div>
  </div>

  <!-- Coming Soon Section -->
  <div class="border-dashed border-2 border-primary/30 rounded-lg p-12 text-center">
    <div class="text-6xl mb-4">🪙</div>
    <h3 class="text-xl font-semibold mb-2 arabic-text">قريباً</h3>
    <p class="text-muted-foreground arabic-text">
      نعمل على إطلاق MSR Stable Coin قريباً مع الشركاء المحليين
    </p>
  </div>
</div>',
  page_content_en = E'<div class="max-w-4xl mx-auto">
  <div class="text-center mb-8">
    <p class="text-xl text-muted-foreground">
      Stable coin backed by Egyptian assets
    </p>
  </div>

  <!-- Features Grid -->
  <div class="grid md:grid-cols-2 gap-6 mb-8">
    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2">🛡️ Stability</h3>
      <p class="text-muted-foreground">
        Stable coin backed by real assets in Egypt to ensure stability and security
      </p>
    </div>

    <div class="bg-card rounded-lg border p-6">
      <h3 class="text-lg font-semibold mb-2">📈 Sustainable Growth</h3>
      <p class="text-muted-foreground">
        Innovative economic model supporting sustainable growth of the local economy
      </p>
    </div>
  </div>

  <!-- Main Content -->
  <div class="bg-card rounded-lg border p-6 mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">What is MSR Stable Coin?</h2>
      <span class="px-3 py-1 text-sm border rounded-full">Coming Soon</span>
    </div>
    <div class="space-y-4">
      <p class="text-muted-foreground">
        MSR Stable Coin is a stable digital currency backed by real assets in Egypt, designed to provide stability and trust in the digital financial system.
      </p>
      
      <div class="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
        <h3 class="font-semibold mb-3">Key Features:</h3>
        <ul class="space-y-2 text-sm text-muted-foreground">
          <li>• Backed by real assets in Egypt</li>
          <li>• Stable value against Egyptian Pound</li>
          <li>• Full transparency in reserves</li>
          <li>• Easy to transfer and use</li>
          <li>• Supporting Egyptian local economy</li>
        </ul>
      </div>

      <div class="text-center pt-6">
        <p class="text-muted-foreground mb-4">
          Coming Soon: Whitepaper and Official Launch
        </p>
      </div>
    </div>
  </div>

  <!-- Coming Soon Section -->
  <div class="border-dashed border-2 border-primary/30 rounded-lg p-12 text-center">
    <div class="text-6xl mb-4">🪙</div>
    <h3 class="text-xl font-semibold mb-2">Coming Soon</h3>
    <p class="text-muted-foreground">
      We are working on launching MSR Stable Coin soon with local partners
    </p>
  </div>
</div>',
  updated_at = now()
WHERE slug = 'stable-coin';