import React, { useState, useEffect } from 'react';
import NewsItem from './NewsItem';
import Spinner from './Spinner';
import PropTypes from 'prop-types';
import InfiniteScroll from "react-infinite-scroll-component";

const News = ({ country = 'us', pageSize = 9, category = 'general', apiKey, setProgress }) => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [hasError, setHasError] = useState(false);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    useEffect(() => {
        document.title = `${capitalizeFirstLetter(category)} - News 24/7`;
        updateNews();
    }, [category]);

    const updateNews = async () => {
        setProgress(10);
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}&page=${page}&pageSize=${pageSize}`;

        setLoading(true);
        setHasError(false);

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            setProgress(30);
            const parsedData = await response.json();

            if (parsedData.status !== "ok") {
                throw new Error(parsedData.message || "Unknown API error");
            }

            setProgress(70);
            setArticles(parsedData.articles || []);
            setTotalResults(parsedData.totalResults || 0);
            setLoading(false);

            setProgress(100);
        } catch (error) {
            console.error("Error fetching news:", error);
            setLoading(false);
            setHasError(true);
            setArticles([]);
            setProgress(100);
        }
    };

    const fetchMoreData = async () => {
        const nextPage = page + 1;
        const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}&page=${nextPage}&pageSize=${pageSize}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const parsedData = await response.json();
            if (parsedData.status !== "ok") {
                throw new Error(parsedData.message || "Unknown API error");
            }

            setArticles([...articles, ...(parsedData.articles || [])]);
            setTotalResults(parsedData.totalResults || totalResults);
            setPage(nextPage);
        } catch (error) {
            console.error("Error fetching more news:", error);
        }
    };

    return (
        <>
            <h1 className="text-center" style={{ margin: '35px 0px', marginTop:'90px ' }}>
                News 24/7 - Top {capitalizeFirstLetter(category)} Headlines
            </h1>

            {hasError && (
                <div className="text-center text-danger">
                    Failed to load news. Please check your API key or try again later.
                </div>
            )}

            {!hasError && (
                <InfiniteScroll
                    dataLength={articles.length}
                    next={fetchMoreData}
                    hasMore={articles.length < totalResults}
                    loader={<Spinner />}
                >
                    <div className="container">
                        <div className="row">
                            {articles.map((element, index) => (
                                <div className="col-md-4" key={element.url + index}>
                                    <NewsItem
                                        title={element.title || "No Title Available"}
                                        description={element.description || "No Description Available"}
                                        imageUrl={element.urlToImage || "https://bigpulp.com/slushpile/wp-content/uploads/2022/04/no-news.jpg"}
                                        newsUrl={element.url || "#"}
                                        author={element.author || "Unknown"}
                                        date={element.publishedAt || "No Date Available"}
                                        source={element.source?.name || "Unknown Source"}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </InfiniteScroll>
            )}

            {!loading && !hasError && articles.length === 0 && (
                <div className="text-center">
                    No articles found in this category.
                </div>
            )}
        </>
    );
};

News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
    apiKey: PropTypes.string.isRequired,
    setProgress: PropTypes.func.isRequired,
};

export default News;