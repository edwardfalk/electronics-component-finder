-- Insert test components
INSERT INTO components (name, description, category, shop, price, currency, in_stock, url, manufacturer)
VALUES 
  ('10k Resistor', '1/4W Through Hole Resistor', 'Resistors', 'Electrokit', 1.50, 'SEK', true, 'https://www.electrokit.com/10k-resistor', 'Yageo'),
  ('LED Red 5mm', 'Bright Red LED', 'LEDs', 'Electrokit', 2.00, 'SEK', true, 'https://www.electrokit.com/led-red', 'Kingbright'),
  ('Arduino Uno', 'Arduino Uno Rev3', 'Development Boards', 'Electrokit', 249.00, 'SEK', true, 'https://www.electrokit.com/arduino-uno', 'Arduino'),
  ('ESP32 DevKit', 'ESP32 Development Board', 'Development Boards', 'Electrokit', 89.00, 'SEK', false, 'https://www.electrokit.com/esp32', 'Espressif');

-- Insert test parts list
INSERT INTO parts_lists (name, description)
VALUES ('Arduino Starter Kit', 'Basic components for Arduino projects');

-- Get the ID of the parts list we just created
DO $$
DECLARE
  list_id UUID;
  arduino_id UUID;
  resistor_id UUID;
  led_id UUID;
BEGIN
  SELECT id INTO list_id FROM parts_lists WHERE name = 'Arduino Starter Kit';
  SELECT id INTO arduino_id FROM components WHERE name = 'Arduino Uno';
  SELECT id INTO resistor_id FROM components WHERE name = '10k Resistor';
  SELECT id INTO led_id FROM components WHERE name = 'LED Red 5mm';

  -- Add components to the parts list
  INSERT INTO parts_list_components (list_id, component_id, quantity)
  VALUES 
    (list_id, arduino_id, 1),
    (list_id, resistor_id, 10),
    (list_id, led_id, 5);
END $$; 