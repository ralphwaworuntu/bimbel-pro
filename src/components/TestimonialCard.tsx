'use client';

interface TestimonialProps {
    name: string;
    role: string;
    content: string;
    avatar?: string;
    rating?: number;
}

export default function TestimonialCard({ name, role, content, avatar, rating = 5 }: TestimonialProps) {
    return (
        <div className="testimonial-card">
            <div className="testimonial-quote-icon">❝</div>
            <p className="testimonial-content">"{content}"</p>

            <div className="testimonial-footer">
                <div className="testimonial-avatar">
                    {avatar ? (
                        <img src={avatar} alt={name} />
                    ) : (
                        <div className="avatar-placeholder">{name.charAt(0)}</div>
                    )}
                </div>
                <div className="testimonial-info">
                    <h4 className="testimonial-name">{name}</h4>
                    <span className="testimonial-role">{role}</span>
                    <div className="testimonial-rating">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < rating ? 'star filled' : 'star'}>★</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
