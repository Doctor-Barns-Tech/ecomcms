-- Consolidated Schema - Part 2: Logic & Policies
-- Generated 2026-02-02

-- FUNCTIONS

CREATE OR REPLACE FUNCTION public.is_admin_or_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'customer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_cms_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_product_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id UUID;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_product_id := OLD.product_id;
    ELSE
        target_product_id := NEW.product_id;
    END IF;

    UPDATE products
    SET 
        rating_avg = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE product_id = target_product_id AND status = 'approved'
        ),
        review_count = (
            SELECT COUNT(*)
            FROM reviews
            WHERE product_id = target_product_id AND status = 'approved'
        )
    WHERE id = target_product_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON loyalty_points FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_return_requests_updated_at BEFORE UPDATE ON return_requests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE TRIGGER update_site_settings_timestamp BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_cms_content_timestamp BEFORE UPDATE ON public.cms_content
FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

CREATE TRIGGER update_banners_timestamp BEFORE UPDATE ON public.banners
FOR EACH ROW EXECUTE FUNCTION update_cms_timestamp();

DROP TRIGGER IF EXISTS tr_update_product_rating ON reviews;
CREATE TRIGGER tr_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE PROCEDURE update_product_rating_stats();


-- RLS ENABLE

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;


-- RLS POLICIES

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Staff view any profile" ON profiles FOR SELECT USING (is_admin_or_staff());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses
CREATE POLICY "Users manage own addresses" ON addresses USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff manage all addresses" ON addresses USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Products & Catalog
CREATE POLICY "Public view active products" ON products FOR SELECT USING (status = 'active' OR is_admin_or_staff());
CREATE POLICY "Staff manage products" ON products USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Public view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Staff manage categories" ON categories USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Public view variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Staff manage variants" ON product_variants USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Public view images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Staff manage images" ON product_images USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Orders
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff manage all orders" ON orders USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Users view own order items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Staff manage order items" ON order_items USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Users view order history" ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Staff manage order history" ON order_status_history USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Cart & Wishlist
CREATE POLICY "Users manage own cart" ON cart_items USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wishlist" ON wishlist_items USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Public view approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users view own reviews" ON reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id); 
CREATE POLICY "Users update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Staff manage reviews" ON reviews USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Public view review images" ON review_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_images.review_id AND reviews.status = 'approved')
);
CREATE POLICY "Users manage review images" ON review_images USING (
  EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_images.review_id AND reviews.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM reviews WHERE reviews.id = review_images.review_id AND reviews.user_id = auth.uid())
);

-- Blog
CREATE POLICY "Public view published posts" ON blog_posts FOR SELECT USING (status = 'published' OR is_admin_or_staff());
CREATE POLICY "Staff manage blog" ON blog_posts USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Support
CREATE POLICY "Users manage own tickets" ON support_tickets USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff manage tickets" ON support_tickets USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Users view ticket messages" ON support_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_messages.ticket_id AND support_tickets.user_id = auth.uid())
);
CREATE POLICY "Users create messages" ON support_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = ticket_id AND support_tickets.user_id = auth.uid())
);
CREATE POLICY "Staff manage messages" ON support_messages USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Returns
CREATE POLICY "Users view own returns" ON return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create returns" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Staff manage returns" ON return_requests USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

CREATE POLICY "Users view return items" ON return_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM return_requests WHERE return_requests.id = return_items.return_request_id AND return_requests.user_id = auth.uid())
);
CREATE POLICY "Staff manage return items" ON return_items USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Store Settings
CREATE POLICY "Staff view settings" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Staff manage settings" ON store_settings USING (is_admin_or_staff()) WITH CHECK (is_admin_or_staff());

-- Audit Logs
CREATE POLICY "Staff view audit logs" ON audit_logs FOR SELECT USING (is_admin_or_staff());
CREATE POLICY "Staff insert audit logs" ON audit_logs FOR INSERT WITH CHECK (is_admin_or_staff());

-- Notifications
CREATE POLICY "Users manage own notifications" ON notifications USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- CMS
CREATE POLICY "Allow public read on site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admin write on site_settings" ON public.site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow public read on cms_content" ON public.cms_content FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin all on cms_content" ON public.cms_content FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow public read on banners" ON public.banners FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin all on banners" ON public.banners FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow public read on navigation_menus" ON public.navigation_menus FOR SELECT USING (true);
CREATE POLICY "Allow admin all on navigation_menus" ON public.navigation_menus FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Allow public read on navigation_items" ON public.navigation_items FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admin all on navigation_items" ON public.navigation_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- STORAGE BUCKETS

INSERT INTO storage.buckets (id, name, public) VALUES 
('products', 'products', true),
('avatars', 'avatars', true),
('reviews', 'reviews', true),
('blog', 'blog', true),
('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
-- Add RLS for storage if needed, e.g. for products bucket
DROP POLICY IF EXISTS "Public View Products" ON storage.objects;
CREATE POLICY "Public View Products" ON storage.objects FOR SELECT USING ( bucket_id = 'products' );

DROP POLICY IF EXISTS "Admin Manage Products" ON storage.objects;
CREATE POLICY "Admin Manage Products" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'products' AND is_admin_or_staff() );
CREATE POLICY "Admin Update Products" ON storage.objects FOR UPDATE USING ( bucket_id = 'products' AND is_admin_or_staff() );
CREATE POLICY "Admin Delete Products" ON storage.objects FOR DELETE USING ( bucket_id = 'products' AND is_admin_or_staff() );

DROP POLICY IF EXISTS "Public View Media" ON storage.objects;
CREATE POLICY "Public View Media" ON storage.objects FOR SELECT USING ( bucket_id = 'media' );

DROP POLICY IF EXISTS "Admin Manage Media" ON storage.objects;
CREATE POLICY "Admin Manage Media" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'media' AND is_admin_or_staff() );
