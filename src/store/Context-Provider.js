/** @format */

import { createContext, useState } from 'react';
import { instance, TRACE_MOE_QUERY, ANILIST_QUERY, query } from '../Api/constant';
import React from 'react';

const defaultstate = {
	imagehandler: () => {},
	image: null,
	urlhandler: () => {},
	url: null,
	fileUpload: () => {},
	video: null,
	loading: false,
	animeinfo: null,
	animeinfoexits: false,
	cardhandler: () => {},
};

export const Context = createContext(defaultstate);
export const ContextProvider = props => {
	const [image, setimage] = useState(null);
	const [url, seturl] = useState('');
	const [video, setvideo] = useState(null);
	const [loading, setloading] = useState(false);
	const [animeinfoexits, setanimeinfoexits] = useState(false);
	const [animeinfo, setanimeinfo] = useState({});

	const Changestates = () => {
		seturl('');
		setloading(false);
		setvideo(null);
		setanimeinfo({});
		setanimeinfoexits(false);
	};
	const cardhandler = () => {
		setanimeinfoexits(false);
	};
	const fetchdata = async (anilistid, episode, from) => {
		var variables = {
			id: anilistid,
		};
		const body = {
			query: query,
			variables: variables,
		};
		try {
			const { data } = await instance.post(ANILIST_QUERY, body);
			console.log(data);
			setanimeinfo({
				episode: episode,
				time: from,
				...data.data.Media,
			});
			setanimeinfoexits(true);
		} catch (error) {
			console.log(error);
		}
	};
	const imagehandler = async acceptedfile => {
		Changestates();
		const file = acceptedfile[0];
		if (file && file.type.substr(0, 5) === 'image') return setimage(file);
	};
	const urlhandler = async e => {
		Changestates();
		const url = e.target.value;
		if (url) return seturl(url);
		return seturl('');
	};
	const fileUpload = async e => {
		seturl('');
		setloading(false);
		e.stopPropagation();
		let formData = new FormData();
		formData.set('image', image);
		const body = formData;
		if (image || url) {
			setloading(true);
		}
		try {
			if (url) {
				const { data } = await instance.get(`?url=${encodeURIComponent(url)}`);
				const { anilist, video, episode, from } = data.result[0];
				setvideo(video);
				setloading(false);
				fetchdata(anilist, episode, from);
			} else {
				const { data } = await instance.post(TRACE_MOE_QUERY, body);
				const { anilist, video, episode, from } = data.result[0];
				setvideo(video);
				setloading(false);
				fetchdata(anilist, episode, from);
			}
		} catch (error) {
			setloading(false);
			if (error.response) return console.log('Something went wrong in the backend', error);
			if (error.request) return console.log('Due to network issue', error);
			return console.log('something else happened', error);
		}
	};

	const createContext = {
		imagehandler: imagehandler,
		image: image,
		urlhandler: urlhandler,
		url: url,
		fileUpload: fileUpload,
		loading: loading,
		video: video,
		animeinfo: animeinfo,
		animeinfoexits: animeinfoexits,
		cardhandler: cardhandler,
	};

	return <Context.Provider value={createContext}>{props.children}</Context.Provider>;
};