import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border mt-16">
      <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">K</span>
          </div>
          <span className="text-sm text-muted-foreground">Kayn Scan © 2026</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/series" className="hover:text-foreground transition-colors">Series</Link>
          <Link to="/latest" className="hover:text-foreground transition-colors">Latest</Link>
        </div>
      </div>
    </footer>
  );
}
