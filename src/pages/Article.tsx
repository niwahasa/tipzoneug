import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { BookOpen, Clock, ArrowLeft, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = trpc.learn.bySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-tz-forest border border-tz-olive/30 rounded w-2/3" />
          <div className="h-4 bg-tz-forest border border-tz-olive/30 rounded w-1/3" />
          <div className="h-64 bg-tz-forest border border-tz-olive/30 rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <BookOpen className="w-12 h-12 text-tz-olive mx-auto mb-3" />
        <p className="text-white/50">Article not found</p>
        <Link to="/learn" className="text-tz-amber text-sm mt-2 inline-block">
          Back to Learn Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 bg-pitch-pattern min-h-screen">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-white/50 hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Learn Hub
      </Link>

      <article className="bg-tz-forest border border-tz-olive/30 rounded-sm overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-4">
            <span className={cn(
              "px-2 py-0.5 text-xs capitalize border rounded-sm",
              article.category === "beginner" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
              article.category === "strategy" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
              article.category === "how-to" ? "bg-green-500/10 text-green-400 border-green-500/20" :
              "bg-orange-500/10 text-orange-400 border-orange-500/20"
            )}>
              {article.category}
            </span>
            {article.readTimeMinutes && (
              <span className="flex items-center gap-1 text-xs text-white/40">
                <Clock className="w-3 h-3" />
                {article.readTimeMinutes} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-white mb-6">
            {article.title}
          </h1>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            {article.content.split('\n').map((paragraph, i) => {
              if (paragraph.startsWith('# ')) {
                return <h2 key={i} className="font-heading text-xl font-bold text-white mt-6 mb-3">{paragraph.slice(2)}</h2>;
              }
              if (paragraph.startsWith('## ')) {
                return <h3 key={i} className="font-heading text-lg font-semibold text-white mt-5 mb-2">{paragraph.slice(3)}</h3>;
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return <p key={i} className="font-semibold text-white/80 my-2">{paragraph.slice(2, -2)}</p>;
              }
              if (paragraph.startsWith('- ')) {
                return <li key={i} className="text-white/60 ml-4 my-1">{paragraph.slice(2)}</li>;
              }
              if (paragraph.trim() === '') {
                return null;
              }
              return <p key={i} className="text-white/60 leading-relaxed my-3">{paragraph}</p>;
            })}
          </div>

          {/* Share */}
          <div className="mt-8 pt-6 border-t border-tz-olive/30">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out this article on TipZone UG: ${article.title}\n\nhttps://tipzone.ug/learn/${article.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-tz-whatsapp/20 text-tz-whatsapp text-sm font-medium rounded-sm hover:bg-tz-whatsapp/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Share on WhatsApp
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
