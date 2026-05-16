export function processCommand(command: string): {
  action: string;
  url?: string;
  isBrowserAction: boolean;
} {
  const lowerCmd = command.toLowerCase().trim();

  // General Browsing: "Open [website name]"
  const openMatch = lowerCmd.match(/^open\s+(.+)$/);
  if (
    openMatch &&
    !lowerCmd.includes("youtube") &&
    !lowerCmd.includes("spotify") &&
    !lowerCmd.includes("whatsapp")
  ) {
    let target = openMatch[1].trim();
    
    // Check if it's already a URL or a special protocol
    if (target.startsWith("http://") || target.startsWith("https://")) {
      return {
        action: `Navigating to ${target}, Yasin.`,
        url: target,
        isBrowserAction: true,
      };
    }

    // Sanitize specifically to avoid JS injection or invalid protocols
    if (target.toLowerCase().startsWith("javascript:") || target.includes("(")) {
      return {
        action: "I can't execute scripts directly like that, Yasin. Let's stick to creative strategy.",
        isBrowserAction: false
      };
    }

    let website = target.replace(/\s+/g, "");
    if (!website.includes(".")) {
      website += ".com";
    }
    
    return {
      action: `Opening ${target} specifically for your workflow, Yasin.`,
      url: `https://www.${website}`,
      isBrowserAction: true,
    };
  }

  // Media Search: "Play [song/video] on YouTube"
  const ytMatch = lowerCmd.match(/^play\s+(.+?)\s+on\s+youtube$/);
  if (ytMatch) {
    const query = encodeURIComponent(ytMatch[1].trim());
    return {
      action: `Buffering ${ytMatch[1]} on YouTube. Let's get that inspiration rolling.`,
      url: `https://www.youtube.com/results?search_query=${query}`,
      isBrowserAction: true,
    };
  }

  // Media Search: "Search [query] on Spotify"
  const spotifyMatch = lowerCmd.match(/^search\s+(.+?)\s+on\s+spotify$/);
  if (spotifyMatch) {
    const query = encodeURIComponent(spotifyMatch[1].trim());
    return {
      action: `Sourcing ${spotifyMatch[1]} on Spotify for your focus session.`,
      url: `https://open.spotify.com/search/${query}`,
      isBrowserAction: true,
    };
  }

  // WhatsApp Web: "Send a WhatsApp message to [number] saying [message]"
  const waMatch = lowerCmd.match(
    /^send\s+a\s+whatsapp\s+message\s+to\s+([\d\+\s]+)\s+saying\s+(.+)$/,
  );
  if (waMatch) {
    const number = waMatch[1].replace(/\s+/g, "");
    const message = encodeURIComponent(waMatch[2].trim());
    return {
      action: `Dispatching your message. Networking is priority, Yasin.`,
      url: `https://web.whatsapp.com/send?phone=${number}&text=${message}`,
      isBrowserAction: true,
    };
  }

  return { action: "", isBrowserAction: false };
}
