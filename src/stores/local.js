import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { i18n } from '@/i18n'


export const useLocaleStore = defineStore('locale',()=>{
    const current = ref(i18n.global.locale.value)
    const available = ['en', 'fr', 'ar']

    function setLocale(lang){
        if(!available.includes(lang)) return
        current.value = lang
        i18n.global.locale.value = lang
        localStorage.setItem('locale',lang)
        document.documentElement.lang = lang
        document.documentElement.dir = lang=== 'ar'? 'rtl' : 'ltr'
    }

    watch(current,(v)=> setLocale(v), {
        immediate: true
    })

    return {
        current, available, setLocale
    }
})