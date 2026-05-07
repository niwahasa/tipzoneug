import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  BookOpen,
  Clock,
  ArrowRight,
  GraduationCap,
  Lightbulb,
  Wrench,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { key: "all", label: "All", icon: BookOpen },
  { key: "beginner", label: "Beginner", icon: GraduationCap },
  { key: "strategy", label: "Strategy", icon: Lightbulb },
  { key: "how-to", label: "How-To", icon: BookOpen },
  { key: "tools", label: "Tools", icon: Wrench },
] as const;

export default function Learn() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") ?? "all");
  const [language, setLanguage] = useState<"en" | "lg">("en");

  const { data: articles } = trpc.learn.list.useQuery({
    category: activeCategory !== "all" ? activeCategory as "beginner" | "strategy" | "how-to" | "tools" : undefined,
    language,
  });

  const categoryIcon = (category: string) => {
    switch (category) {
      case "beginner": return <GraduationCap className="w-4 h-4" />;
      case "strategy": return <Lightbulb className="w-4 h-4" />;
      case "how-to": return <BookOpen className="w-4 h-4" />;
      case "tools": return <Wrench className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const categoryColor = (category: string) => {
    switch (category) {
      case "beginner": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "strategy": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "how-to": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "tools": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default: return "bg-tz-olive/30 text-white/60 border-tz-olive/30";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-white">Learn Hub</h1>
        <p className="text-sm text-white/50 mt-1">Master the art of sports betting</p>
      </div>

      {/* Language Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-white/40">Language:</span>
        <div className="flex bg-tz-forest border border-tz-olive/30 rounded-sm overflow-hidden">
          <button
            onClick={() => setLanguage("en")}
            className={cn(
              "px-3 py-1 text-xs font-medium transition-colors",
              language === "en" ? "bg-tz-amber text-tz-forest" : "text-white/60 hover:text-white"
            )}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("lg")}
            className={cn(
              "px-3 py-1 text-xs font-medium transition-colors",
              language === "lg" ? "bg-tz-amber text-tz-forest" : "text-white/60 hover:text-white"
            )}
          >
            Luganda
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-sm border whitespace-nowrap transition-colors",
              activeCategory === cat.key
                ? "bg-tz-amber text-tz-forest border-tz-amber"
                : "bg-tz-forest text-white/60 border-tz-olive/30 hover:border-tz-amber/50"
            )}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {articles?.map((article) => (
          <Link
            key={article.id}
            to={`/learn/${article.slug}`}
            className="group bg-tz-forest border border-tz-olive/30 rounded-sm p-5 hover:border-tz-amber/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("flex items-center gap-1.5 px-2 py-0.5 border rounded-sm", categoryColor(article.category))}>
                {categoryIcon(article.category)}
                <span className="text-xs capitalize">{article.category}</span>
              </div>
              {article.readTimeMinutes && (
                <span className="flex items-center gap-1 text-xs text-white/40">
                  <Clock className="w-3 h-3" />
                  {article.readTimeMinutes} min
                </span>
              )}
            </div>
            <h3 className="font-heading font-semibold text-white group-hover:text-tz-amber transition-colors mb-2">
              {article.title}
            </h3>
            <div className="flex items-center gap-1 text-tz-amber text-sm font-medium">
              Read Article
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {(!articles || articles.length === 0) && (
        <div className="text-center py-16 bg-tz-forest border border-tz-olive/30 rounded-sm">
          <BookOpen className="w-12 h-12 text-tz-olive mx-auto mb-3" />
          <p className="text-white/50">No articles found</p>
        </div>
      )}

      {/* Beginner Path */}
      {activeCategory === "all" && (
        <div className="mt-12 bg-tz-forest border border-tz-olive/30 rounded-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-tz-amber" />
            <h3 className="font-heading font-semibold text-white">Beginner Learning Path</h3>
          </div>
          <p className="text-sm text-white/50 mb-4">
            New to sports betting? Follow this curated sequence to build your knowledge.
          </p>
          <div className="space-y-3">
            {[
              { step: 1, title: "Understanding Betting Odds", slug: "understanding-betting-odds" },
              { step: 2, title: "Bankroll Management", slug: "bankroll-management" },
              { step: 3, title: "How to Read Football Stats", slug: "how-to-read-football-stats" },
              { step: 4, title: "Accumulator Betting Guide", slug: "accumulator-betting-guide" },
              { step: 5, title: "Responsible Betting Guidelines", slug: "responsible-betting-guidelines" },
            ].map((item) => (
              <Link
                key={item.step}
                to={`/learn/${item.slug}`}
                className="flex items-center gap-4 p-3 bg-tz-surface rounded-sm hover:bg-tz-olive/20 transition-colors group"
              >
                <div className="w-8 h-8 bg-tz-amber/20 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-tz-amber">{item.step}</span>
                </div>
                <p className="text-sm text-white group-hover:text-tz-amber transition-colors flex-1">{item.title}</p>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-tz-amber transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
