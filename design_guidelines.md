{
  "brand_attributes": {
    "invite_experience": [
      "premium + tactile (paper, wax, emboss)",
      "Brazilian torcida energy (controlled, not noisy)",
      "mobile-first, thumb-friendly, WhatsApp-friendly",
      "celebratory but elegant (gold details, restrained patterns)"
    ],
    "admin_experience": [
      "clean, professional, data-first",
      "fast scanning hierarchy",
      "light-first with optional dark mode",
      "minimal decoration"
    ]
  },
  "design_personality": {
    "style_fusion": [
      "Invitation: ‘Luxury stationery’ + ‘stadium atmosphere’ (subtle grass texture + gold foil accents)",
      "Layout principle: Bento grid for info blocks + centered hero object (envelope)",
      "Motion principle: Framer Motion ‘physicality’ (spring, inertia, layered depth)",
      "Admin: Swiss-style clarity (grid, whitespace) + shadcn dashboard patterns"
    ],
    "do_not": [
      "No cluttered football stickers everywhere",
      "No neon gradients or saturated purple/pink gradients",
      "No transparent backgrounds (use solid surfaces)",
      "No gimmicky bouncy animations; keep premium"
    ]
  },
  "typography": {
    "font_pairing": {
      "display": {
        "name": "Bodoni Moda",
        "use": "Names + key invitation headings (luxury invitation feel)",
        "google_fonts": "https://fonts.google.com/specimen/Bodoni+Moda"
      },
      "body_ui": {
        "name": "Manrope",
        "use": "Body copy, buttons, admin UI",
        "google_fonts": "https://fonts.google.com/specimen/Manrope"
      },
      "numeric_mono_optional": {
        "name": "Azeret Mono",
        "use": "Admin logs timestamps / IDs (optional)",
        "google_fonts": "https://fonts.google.com/specimen/Azeret+Mono"
      }
    },
    "tailwind_usage": {
      "invite_headline": "font-[Bodoni_Moda] tracking-tight",
      "invite_body": "font-[Manrope]",
      "admin": "font-[Manrope]"
    },
    "type_scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl",
      "h2": "text-base md:text-lg",
      "body": "text-sm sm:text-base",
      "small": "text-xs sm:text-sm",
      "numbers": "tabular-nums"
    },
    "copy_tone": {
      "invite": "warm, short lines, Portuguese-first labels",
      "admin": "neutral, operational language"
    }
  },
  "color_system": {
    "notes": [
      "Use Brazil palette but ‘muted-premium’: deep green + warm yellow + disciplined blue + ivory paper.",
      "Gold is for micro-details only (borders, icons, separators).",
      "No gradients on cards or reading areas; only small decorative background accents (<=20% viewport)."
    ],
    "tokens_css_variables": {
      "invite": {
        "--bg": "46 60% 97%  /* ivory */",
        "--fg": "210 20% 12%  /* ink */",
        "--card": "48 55% 96%  /* paper */",
        "--card-fg": "210 20% 12%",
        "--primary": "145 100% 20%  /* deep green ~ #006400 */",
        "--primary-fg": "0 0% 100%",
        "--accent": "46 100% 55%  /* yellow ~ #FFD700 */",
        "--accent-fg": "210 20% 12%",
        "--blue": "214 100% 26%  /* #003087 */",
        "--gold": "43 74% 66%  /* light gold detail */",
        "--muted": "45 35% 92%",
        "--muted-fg": "210 10% 35%",
        "--border": "45 25% 86%",
        "--ring": "145 100% 20%",
        "--success": "145 70% 32%",
        "--danger": "0 72% 52%"
      },
      "admin": {
        "--background": "0 0% 100%",
        "--foreground": "222.2 47.4% 11.2%",
        "--card": "0 0% 100%",
        "--card-foreground": "222.2 47.4% 11.2%",
        "--primary": "145 100% 20%  /* reuse green for brand continuity */",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "210 40% 96%",
        "--secondary-foreground": "222.2 47.4% 11.2%",
        "--muted": "210 40% 96%",
        "--muted-foreground": "215.4 16.3% 46.9%",
        "--border": "214.3 31.8% 91.4%",
        "--ring": "145 100% 20%"
      }
    },
    "hex_reference": {
      "green_deep": "#006400",
      "green_bright": "#00A550",
      "yellow": "#FFD700",
      "yellow_warm": "#FFCC00",
      "blue": "#003087",
      "white": "#FFFFFF",
      "gold_detail": "#D8B55B"
    },
    "allowed_gradients": {
      "invite_background_accent_only": [
        "radial-gradient(600px circle at 20% 10%, rgba(255, 204, 0, 0.18), transparent 55%)",
        "radial-gradient(700px circle at 80% 0%, rgba(0, 165, 80, 0.14), transparent 60%)"
      ]
    }
  },
  "texture_and_background": {
    "invite_background": {
      "approach": [
        "Solid ivory base + subtle noise overlay (CSS) + very faint grass/stadium vignette image behind envelope.",
        "Keep textures at 6–10% opacity; never reduce text contrast."
      ],
      "css_noise_snippet": "background-image: radial-gradient(600px circle at 20% 10%, rgba(255,204,0,0.18), transparent 55%), radial-gradient(700px circle at 80% 0%, rgba(0,165,80,0.14), transparent 60%); position: relative;" 
    },
    "paper_surface": {
      "use": "Invite card background (paper feel)",
      "image_urls": [
        "https://images.unsplash.com/photo-1656055449458-b5da9d3bb8b2?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85",
        "https://images.unsplash.com/photo-1656055450593-5f9fc1e88b65?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      ]
    },
    "stadium_grass_optional": {
      "use": "Very subtle background behind envelope only (blurred)",
      "image_urls": [
        "https://images.unsplash.com/photo-1571190894029-caa26b1f4c09?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      ]
    }
  },
  "layout_and_grid": {
    "invite": {
      "mobile_first_frame": {
        "max_width": "max-w-[420px]",
        "padding": "px-4 pt-6 pb-10",
        "structure": [
          "Top: small ‘Copa do Mundo’ ribbon + date chip",
          "Center: envelope interactive stage (dominant)",
          "Below: invite card content (bento info blocks)",
          "Bottom: sticky CTA bar (Confirm/Cancel)"
        ]
      },
      "desktop": {
        "behavior": "Keep envelope centered; card and CTAs below; avoid wide lines (max-w-[520px])."
      }
    },
    "admin": {
      "grid": "12-col on desktop, 4-col on mobile",
      "page_container": "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
      "sidebar": "Sheet on mobile, fixed sidebar on desktop",
      "tables": "Full-width with horizontal scroll on small screens (ScrollArea)"
    }
  },
  "components": {
    "component_path": {
      "shadcn": {
        "button": "/app/frontend/src/components/ui/button.jsx",
        "card": "/app/frontend/src/components/ui/card.jsx",
        "dialog": "/app/frontend/src/components/ui/dialog.jsx",
        "alert_dialog": "/app/frontend/src/components/ui/alert-dialog.jsx",
        "drawer": "/app/frontend/src/components/ui/drawer.jsx",
        "sheet": "/app/frontend/src/components/ui/sheet.jsx",
        "tabs": "/app/frontend/src/components/ui/tabs.jsx",
        "table": "/app/frontend/src/components/ui/table.jsx",
        "input": "/app/frontend/src/components/ui/input.jsx",
        "textarea": "/app/frontend/src/components/ui/textarea.jsx",
        "select": "/app/frontend/src/components/ui/select.jsx",
        "badge": "/app/frontend/src/components/ui/badge.jsx",
        "separator": "/app/frontend/src/components/ui/separator.jsx",
        "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
        "calendar": "/app/frontend/src/components/ui/calendar.jsx",
        "sonner_toast": "/app/frontend/src/components/ui/sonner.jsx"
      }
    },
    "invite_custom_components_to_build": [
      "EnvelopeStage.js (Framer Motion envelope + wax seal)",
      "InviteCard.js (paper card + bento info)",
      "RsvpModal.js (Dialog + success/cancel variants)",
      "StickyCtaBar.js (two big CTAs, 48px min height)",
      "WhatsAppOgMetaHelper.js (sets document title/meta for preview where possible; OG image is static asset)"
    ],
    "admin_custom_components_to_build": [
      "AdminShell.js (sidebar + topbar + content)",
      "StatCard.js",
      "GuestsTable.js (Table + actions)",
      "GuestFormDrawer.js (Drawer for create/edit)",
      "LogsTimeline.js (ScrollArea list)"
    ]
  },
  "buttons": {
    "shape": "rounded-xl (8–12px), tall",
    "sizes": {
      "primary_cta": "h-12 px-5 text-base",
      "secondary_cta": "h-12 px-5 text-base",
      "admin": "h-10 px-4 text-sm"
    },
    "variants": {
      "invite_confirm": {
        "classes": "bg-[color:var(--br-green)] text-white hover:bg-[#005a00] focus-visible:ring-2 focus-visible:ring-offset-2",
        "notes": "Use deep green; add subtle inner highlight via pseudo-element if desired."
      },
      "invite_cancel": {
        "classes": "border border-[rgba(0,100,0,0.25)] bg-white text-[#0f2a16] hover:bg-[#f4f7f4]",
        "notes": "Outlined, calm."
      },
      "admin_primary": {
        "classes": "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:brightness-[0.98]"
      },
      "ghost": {
        "classes": "bg-transparent hover:bg-[hsl(var(--muted))]"
      }
    },
    "micro_interactions": [
      "Hover: translate-y-[-1px] + shadow increase (desktop only)",
      "Tap: scale 0.98 (mobile) with spring",
      "Focus: visible ring using --ring"
    ]
  },
  "invite_page_ui_spec": {
    "envelope_stage": {
      "visual": [
        "Envelope: warm white paper with subtle bevel shadow",
        "Wax seal: deep red-burgundy (premium contrast) with tiny gold emboss ring",
        "Small Brazil ribbon strip (green/yellow/blue) as a top edge accent"
      ],
      "animation_sequence_framer_motion": {
        "states": [
          "closed (seal intact)",
          "seal_break (crack + tiny fragments fade)",
          "flap_open (rotateX/rotateZ slight)",
          "card_slide (invite card slides up with friction)",
          "settle (micro-bounce damped)"
        ],
        "physics": {
          "type": "spring",
          "stiffness": 260,
          "damping": 26,
          "mass": 0.9
        },
        "timings_ms": {
          "seal_break": 260,
          "flap_open": 520,
          "card_slide": 650
        },
        "sound": {
          "on_open": "short ‘seal crack’ + soft paper slide (optional, user can mute)",
          "on_confirm": "short crowd cheer (very low volume)"
        },
        "accessibility": "Respect prefers-reduced-motion: skip to open state with fade only."
      },
      "interaction": {
        "tap_target": "Seal area min 56x56",
        "data_testids": {
          "seal_button": "invite-envelope-seal-button",
          "envelope_stage": "invite-envelope-stage"
        }
      }
    },
    "invite_card": {
      "structure": [
        "Header: Anderson & Arthur (Bodoni) + small subtitle ‘Aniversário’",
        "Info bento: Date, Time, Dress code, Address",
        "Map link row (Button variant=ghost with external icon)",
        "Footer: RSVP status chip"
      ],
      "bento_blocks": {
        "classes": "grid grid-cols-2 gap-3",
        "block": "rounded-2xl bg-white border border-[rgba(216,181,91,0.35)] p-3"
      },
      "data_testids": {
        "invite-card": "invite-card",
        "maps-link": "invite-maps-link"
      }
    },
    "sticky_cta_bar": {
      "classes": "fixed bottom-0 left-0 right-0 bg-[#fff] border-t border-[rgba(0,0,0,0.08)] px-4 py-3",
      "layout": "grid grid-cols-2 gap-3 max-w-[420px] mx-auto",
      "buttons": {
        "confirm": "Confirmar presença",
        "cancel": "Cancelar presença"
      },
      "data_testids": {
        "confirm": "rsvp-confirm-button",
        "cancel": "rsvp-cancel-button"
      }
    },
    "rsvp_modals": {
      "confirm": {
        "component": "Dialog",
        "tone": "success",
        "visual": "green header strip (solid) + subtle confetti",
        "data_testids": {
          "open": "rsvp-confirm-open",
          "submit": "rsvp-confirm-submit",
          "success": "rsvp-confirm-success-text"
        }
      },
      "cancel": {
        "component": "AlertDialog",
        "tone": "neutral",
        "data_testids": {
          "open": "rsvp-cancel-open",
          "confirm": "rsvp-cancel-confirm"
        }
      }
    },
    "confetti": {
      "library": "canvas-confetti",
      "install": "npm i canvas-confetti",
      "usage_snippet_js": "import confetti from 'canvas-confetti';\n\nexport function fireInviteConfetti() {\n  confetti({\n    particleCount: 70,\n    spread: 55,\n    startVelocity: 28,\n    gravity: 0.9,\n    ticks: 180,\n    colors: ['#006400', '#00A550', '#FFD700', '#003087', '#FFFFFF'],\n    origin: { x: 0.5, y: 0.65 }\n  });\n}",
      "note": "Trigger only on successful confirm; keep subtle."
    }
  },
  "admin_ui_spec": {
    "shell": {
      "topbar": [
        "Breadcrumb + page title",
        "Search input (guests)",
        "User menu + theme toggle"
      ],
      "sidebar_nav": [
        "/admin/dashboard",
        "/admin/guests",
        "/admin/settings"
      ],
      "data_testids": {
        "sidebar": "admin-sidebar",
        "topbar": "admin-topbar"
      }
    },
    "dashboard": {
      "stat_cards": {
        "layout": "grid grid-cols-2 lg:grid-cols-4 gap-4",
        "cards": [
          "Total convidados",
          "Confirmados",
          "Cancelados",
          "Pendentes"
        ],
        "data_testids": {
          "total": "admin-stat-total",
          "confirmed": "admin-stat-confirmed",
          "cancelled": "admin-stat-cancelled",
          "pending": "admin-stat-pending"
        }
      },
      "charts_optional": {
        "library": "recharts",
        "install": "npm i recharts",
        "use": "Small RSVP trend line (last 7 days) + status pie",
        "note": "Keep charts minimal; avoid 3D."
      }
    },
    "guests_table": {
      "features": [
        "Search by name/phone",
        "Filter by status (confirmed/cancelled/pending)",
        "Row actions: edit, delete",
        "Bulk actions optional"
      ],
      "components": [
        "Table",
        "DropdownMenu for row actions",
        "Dialog/Drawer for edit/create"
      ],
      "data_testids": {
        "table": "admin-guests-table",
        "create": "admin-guests-create-button",
        "search": "admin-guests-search-input"
      }
    },
    "settings": {
      "fields": [
        "Event title",
        "Date (Calendar)",
        "Time",
        "Dress code",
        "Address",
        "Google Maps link",
        "RSVP close date"
      ],
      "data_testids": {
        "form": "admin-settings-form",
        "save": "admin-settings-save-button"
      }
    },
    "logs": {
      "presentation": "Timeline list in ScrollArea; each item shows action + timestamp + guest",
      "data_testids": {
        "list": "admin-rsvp-logs"
      }
    }
  },
  "motion_principles": {
    "global": [
      "Use Framer Motion for entrance: fade + slight y (6–10px) with spring",
      "Avoid looping animations except subtle ambient (e.g., tiny shimmer on wax seal)",
      "No universal transition: never transition: all"
    ],
    "invite": [
      "Envelope is the hero: all other elements should wait until envelope opens",
      "Use layered shadows to sell depth (envelope above background, card above envelope)",
      "Confetti only once per confirm"
    ],
    "admin": [
      "Fast UI: minimal motion; use subtle hover and drawer slide",
      "Table row hover: background tint only"
    ]
  },
  "accessibility": {
    "requirements": [
      "Buttons min height 48px on invite",
      "Focus-visible rings on all interactive elements",
      "Color contrast: avoid yellow text on white; use yellow as background/accent only",
      "prefers-reduced-motion support for envelope + confetti",
      "All interactive/key info elements must include data-testid"
    ]
  },
  "performance": {
    "invite": [
      "Lazy-load admin routes",
      "Compress OG image + background textures",
      "Avoid heavy video; use CSS noise instead",
      "Preload fonts with display swap"
    ]
  },
  "open_graph": {
    "requirements": [
      "Create a static OG image (1200x630) with envelope + names + date for WhatsApp preview",
      "Keep it simple: ivory background, green headline, small yellow/blue accents"
    ],
    "suggested_composition": "Centered envelope silhouette + ‘Anderson & Arthur’ + ‘13/06/2026’ + small ‘Copa do Mundo’ ribbon"
  },
  "image_urls": {
    "invite_background_optional": [
      {
        "category": "stadium_grass_blur",
        "description": "Use as blurred, low-opacity background behind envelope stage only",
        "url": "https://images.unsplash.com/photo-1571190894029-caa26b1f4c09?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      }
    ],
    "paper_textures": [
      {
        "category": "paper_texture",
        "description": "Paper texture for invite card background (very subtle overlay)",
        "url": "https://images.unsplash.com/photo-1656055449458-b5da9d3bb8b2?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      },
      {
        "category": "paper_texture",
        "description": "Alternative paper texture",
        "url": "https://images.unsplash.com/photo-1656055450593-5f9fc1e88b65?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      }
    ],
    "admin_illustration_optional": [
      {
        "category": "admin_header_bg_optional",
        "description": "Optional header image for admin login (keep subtle, low opacity)",
        "url": "https://images.unsplash.com/photo-1601217817505-8e2cfe5b8419?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
      }
    ]
  },
  "instructions_to_main_agent": {
    "global_setup": [
      "Replace default CRA App.css centered header usage; do not use .App { text-align:center }.",
      "In /app/frontend/src/index.css: define two theme scopes: .theme-invite and .theme-admin overriding CSS variables (HSL tokens above).",
      "Load Google Fonts (Bodoni Moda, Manrope) in public/index.html or via CSS @import; set body font to Manrope; apply Bodoni only to invite headings.",
      "Ensure every button/input/link/table action has data-testid in kebab-case.",
      "Use shadcn components from /src/components/ui (no native HTML dropdown/calendar/toast).",
      "Use sonner for toasts (already present)."
    ],
    "invite_implementation_notes": [
      "Build EnvelopeStage with layered divs (envelope back, flap, seal button, card). Use motion.div with transform-origin for flap.",
      "No transparent backgrounds: envelope/card surfaces must be solid (paper/white).",
      "Sticky CTA bar must not cover content: add bottom padding equal to bar height (pb-24).",
      "Add prefers-reduced-motion: if true, render envelope already open and skip confetti."
    ],
    "admin_implementation_notes": [
      "Admin routes should use .theme-admin wrapper; invite routes use .theme-invite wrapper.",
      "Guests CRUD: use Drawer for create/edit on desktop and mobile; keep forms short with clear labels.",
      "Tables: use ScrollArea for horizontal overflow on mobile; keep row height comfortable (py-3)."
    ],
    "libraries": [
      {
        "name": "canvas-confetti",
        "why": "Subtle celebration on RSVP confirm",
        "install": "npm i canvas-confetti"
      },
      {
        "name": "recharts (optional)",
        "why": "Admin dashboard RSVP trends",
        "install": "npm i recharts"
      }
    ]
  },
  "references": {
    "inspiration_links": [
      "https://dribbble.com/shots/20362424-Fifa-World-Cup-Invitation-GA-N",
      "https://dribbble.com/tags/wax-seal?page=3",
      "https://dribbble.com/shots/26758329-FIFA-World-Cup-2026-Mobile-App-Design",
      "https://www.shadcnblocks.com/block/dashboard18",
      "https://ui.shadcn.com/examples/dashboard"
    ]
  },
  "general_ui_ux_design_guidelines": [
    "You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms",
    "You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text",
    "NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json",
    " **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.",
    "**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors",
    "**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal",
    "- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc",
    "- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead.",
    "- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.",
    "- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.",
    "- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme",
    "**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones",
    "**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component",
    "**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]",
    "**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})",
    "**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`",
    "Use 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals."
  ]
}
