# **App Name**: La Lora Surf Cam

## Core Features:

- Live Stream Display: Display the live stream from La Lora Surf Cam (Twitch channel: elsurfo). Embed the video iframe (src="https://player.twitch.tv/?channel=elsurfo&parent=www.example.com") and chat iframe (src="https://www.twitch.tv/embed/elsurfo/chat?parent=www.example.com"). Give thanks to seataya.com with a link to their website.
- Password Protected Access: Implement a login system where users must enter their email and password to view the stream. The password 'santateresa2025' is stored in an environment variable (camPassword).
- Google Sign-In: Implement Google Sign-In as an alternative login method.
- Limited Free Access: For free access (password: santateresa2025), the video stream is available for one minute, after which a blurring effect (opacity or overlay) is applied to obscure the video.
- Additional Services Menu: Offer a navigation menu with links to surf classes, lodging, and restaurant recommendations (links to external resources).

## Style Guidelines:

- Primary color: Deep turquoise (#45B69C) to reflect the ocean waves and surfing theme. The choice of turquoise seeks to evoke the waters without defaulting to predictable blue hues.
- Background color: Very light turquoise (#E0F4F1) for a calm, unobtrusive backdrop.
- Accent color: Warm coral (#F07A5B) to highlight interactive elements like the login button and navigation links.
- Font pairing: 'Poppins' (sans-serif) for headlines and short informational texts; 'PT Sans' (sans-serif) for body text. Note: currently only Google Fonts are supported.
- Use clean, minimalist icons for the navigation menu (surf classes, lodging, restaurants).
- Emphasize the video stream and chat. Place the navigation menu at the top or side of the page.
- Subtle fade-in animations for content loading.